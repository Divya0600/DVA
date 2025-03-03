import os
import requests
import logging
from datetime import datetime
import json
import csv
from bs4 import BeautifulSoup
import unicodedata
import urllib3
from concurrent.futures import ThreadPoolExecutor, as_completed

# Configure logging
logging.basicConfig(level=logging.INFO)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class ALMClient:
    def __init__(self, alm_url, client_id, secret, domain, project):
        self.alm_url = alm_url
        self.domain = domain
        self.project = project
        self.cookies = self.authenticate(client_id, secret)
        self.session = requests.Session()
        self.session.cookies.update(self.cookies)
        self.session.verify = False

    def authenticate(self, client_id, secret):
        auth_endpoint = f"{self.alm_url}/rest/oauth2/login"
        payload = {"clientId": client_id, "secret": secret}
        headers = {'Content-Type': 'application/json'}

        try:
            response = requests.post(auth_endpoint, json=payload, headers=headers, verify=False)
            if response.status_code == 200:
                cookies = {
                    'LWSSO_COOKIE_KEY': response.cookies.get('LWSSO_COOKIE_KEY'),
                    'QCSession': response.cookies.get('QCSession'),
                    'XSRF-TOKEN': next((c.value for c in response.cookies if c.name == 'XSRF-TOKEN'), None)
                }
                logging.info('Logged in ALM successfully')
                return cookies
            else:
                logging.error(f'Failed to log in ALM. Status code: {response.status_code}')
                return None
        except Exception as e:
            logging.error(f'Error during authentication: {str(e)}')
            return None

    def make_request(self, endpoint, method='GET', data=None, params=None):
        url = f"{self.alm_url}/rest/domains/{self.domain}/projects/{self.project}/{endpoint}"
        headers = {
            'cache-control': "no-cache",
            'Accept': "application/json",
            'Content-Type': "application/json"
        }
        try:
            response = self.session.request(method, url, headers=headers, json=data, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logging.error(f'Error making request: {str(e)}')
            return None

    def retrieve_single_test_data(self, test_id):
        return self.make_request(f"tests/{test_id}")

    def retrieve_test_fields(self):
        return self.make_request("customization/entities/test/fields")

    def retrieve_design_steps(self, test_id):
        return self.make_request("design-steps", params={"query": f"{{parent-id[{test_id}]}}"})

    def retrieve_attachments(self, entity_type, entity_id):
        return self.make_request(f"{entity_type}/{entity_id}/attachments")

    def retrieve_audits(self, test_id):
        return self.make_request(f"tests/{test_id}/audits")

    def retrieve_test_folder_path(self, test_id):
        test_data = self.retrieve_single_test_data(test_id)
        if test_data:
            folder_id = next((field['values'][0]['value'] for field in test_data['Fields'] if field['Name'] == 'parent-id'), None)
            if folder_id:
                return self.get_folder_path(folder_id)
        return None

    def get_folder_path(self, folder_id):
        folder_data = self.make_request(f"test-folders/{folder_id}")
        if folder_data:
            folder_name = next((field['values'][0]['value'] for field in folder_data['Fields'] if field['Name'] == 'name'), '')
            parent_id = next((field['values'][0]['value'] for field in folder_data['Fields'] if field['Name'] == 'parent-id'), None)
            if parent_id and parent_id != "0":
                parent_path = self.get_folder_path(parent_id)
                return f"{parent_path}/{folder_name}" if parent_path else folder_name
            return folder_name
        return None

    def download_attachment(self, attachment, save_path):
        attachment_id = next((field['values'][0]['value'] for field in attachment['Fields'] if field['Name'] == 'id'), None)
        if not attachment_id:
            logging.error(f"Attachment ID not found in: {attachment}")
            return

        attachment_url = f"{self.alm_url}/rest/domains/{self.domain}/projects/{self.project}/attachments/{attachment_id}?alt=application/octet-stream"
        headers = {
            'cache-control': "no-cache",
            'Accept': "application/octet-stream",
            'Content-Type': 'application/octet-stream'
        }

        try:
            response = self.session.get(attachment_url, headers=headers, stream=True)
            response.raise_for_status()
            attachment_name = next((field['values'][0]['value'] for field in attachment['Fields'] if field['Name'] == 'name'), None)
            if attachment_name:
                clean_attachment_name = attachment_name.replace(':', '_').replace(' ', '_')
                with open(os.path.join(save_path, clean_attachment_name), 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
                logging.info(f"Downloaded attachment: {clean_attachment_name}")
            else:
                logging.error(f"Attachment name not found in: {attachment}")
        except requests.exceptions.RequestException as e:
            logging.error(f'Error downloading attachment: {str(e)}')

    def get_folder_id_by_path(self, folder_path):
        path_parts = folder_path.strip('/').split('/')
        current_folder_id = '0'  # Root folder ID

        for part in path_parts:
            query = f"{{parent-id[{current_folder_id}];name['{part}']}}"
            folders = self.make_request("test-folders", params={"query": query})
            
            if folders and 'entities' in folders and folders['entities']:
                current_folder_id = next((field['values'][0]['value'] for field in folders['entities'][0]['Fields'] if field['Name'] == 'id'), None)
                if not current_folder_id:
                    logging.error(f"Folder not found: {part}")
                    return None
            else:
                logging.error(f"Folder not found: {part}")
                return None

        return current_folder_id

    def get_tests_in_folder(self, folder_id):
        query = f"{{parent-id[{folder_id}]}}"
        tests = self.make_request("tests", params={"query": query})
        
        if tests and 'entities' in tests:
            return [next((field['values'][0]['value'] for field in test['Fields'] if field['Name'] == 'id'), None) 
                    for test in tests['entities']]
        else:
            logging.error(f"No tests found in folder {folder_id}")
            return []

    def process_test(self, test_id, field_mapping):
        test_data = self.retrieve_single_test_data(test_id)
        audit_data = self.retrieve_audits(test_id)
        attachments_data = self.retrieve_attachments('tests', test_id)
        folder_structure = self.retrieve_test_folder_path(test_id)

        row_data = {}
        for field in test_data.get('Fields', []):
            field_name = field_mapping.get(field['Name'], field['Name'])
            field_values = field.get('values', [])
            field_value = clean_html(field_values[0].get('value', '')) if field_values else ''
            row_data[field_name] = normalize_text(field_value)

        row_data["Test Folder Structure"] = normalize_text(folder_structure) if folder_structure else ""

        return row_data, audit_data, attachments_data, test_id

    def download_tests_by_folder(self, folder_path, field_mapping):
        folder_id = self.get_folder_id_by_path(folder_path)
        if not folder_id:
            logging.error(f"Couldn't find folder: {folder_path}")
            return

        test_ids = self.get_tests_in_folder(folder_id)
        if not test_ids:
            logging.error(f"No tests found in folder: {folder_path}")
            return

        csv_file_path = f"./Download/Issue Report.csv"
        
        all_test_data = []
        design_steps_to_process = []

        with ThreadPoolExecutor(max_workers=5) as executor:
            future_to_test_id = {executor.submit(self.process_test, test_id, field_mapping): test_id for test_id in test_ids}
            
            for future in as_completed(future_to_test_id):
                test_id = future_to_test_id[future]
                try:
                    row_data, audit_data, attachments_data, test_id = future.result()
                    all_test_data.append(row_data)

                    if audit_data:
                        audit_html_dir = f'./Download/Attachments/{test_id}'
                        os.makedirs(audit_html_dir, exist_ok=True)
                        html_content = generate_html_table(audit_data)
                        save_html_to_file(html_content, os.path.join(audit_html_dir, f"History {test_id}.html"))

                    if attachments_data and 'entities' in attachments_data:
                        attachments_dir = f'./Download/Attachments/{test_id}'
                        os.makedirs(attachments_dir, exist_ok=True)
                        for attachment in attachments_data['entities']:
                            self.download_attachment(attachment, attachments_dir)

                    design_steps_to_process.append(test_id)

                except Exception as exc:
                    logging.error(f'Error processing test {test_id}: {str(exc)}')

        # Process design steps after all other data has been collected
        self.process_design_steps(design_steps_to_process, all_test_data)

        write_consolidated_test_data_to_csv(all_test_data, field_mapping, csv_file_path)


    def process_design_steps(self, test_ids, all_test_data):
        for test_id in test_ids:
            design_steps_data = self.retrieve_design_steps(test_id)
            if design_steps_data and 'entities' in design_steps_data:
                test_data = next((data for data in all_test_data if data.get('Test ID') == test_id), None)
                if test_data:
                    # Clear any existing step data
                    for key in list(test_data.keys()):
                        if key.startswith("Step Name") or key.startswith("Step Description") or key.startswith("Step Expected Result"):
                            del test_data[key]
                    
                    for i, step in enumerate(design_steps_data['entities'], 1):
                        step_name = next((field['values'][0]['value'] for field in step['Fields'] if field['Name'] == 'name'), '')
                        step_description = next((field['values'][0]['value'] for field in step['Fields'] if field['Name'] == 'description'), '')
                        step_expected = next((field['values'][0]['value'] for field in step['Fields'] if field['Name'] == 'expected'), '')
                        
                        test_data[f"Step Name {i}"] = normalize_text(clean_html(step_name))
                        test_data[f"Step Description {i}"] = normalize_text(clean_html(step_description))
                        test_data[f"Step Expected Result {i}"] = normalize_text(clean_html(step_expected))

                        step_id = next((field['values'][0]['value'] for field in step['Fields'] if field['Name'] == 'id'), None)
                        step_number = next((field['values'][0]['value'] for field in step['Fields'] if field['Name'] == 'step-order'), None)
                        if step_id and step_number:
                            step_attachments_data = self.retrieve_attachments('design-steps', step_id)
                            if step_attachments_data and 'entities' in step_attachments_data:
                                step_attachments_dir = f'./Download/Attachments/{test_id}/Step {step_number}'
                                if step_attachments_data['entities']:
                                    os.makedirs(step_attachments_dir, exist_ok=True)
                                    for attachment in step_attachments_data['entities']:
                                        self.download_attachment(attachment, step_attachments_dir)

def clean_html(html_content):
    if html_content:
        soup = BeautifulSoup(html_content, 'html.parser')
        cleaned_text = soup.get_text(separator=' ', strip=True)
        return normalize_text(cleaned_text)
    return ''

def normalize_text(text):
    if isinstance(text, str):
        return unicodedata.normalize('NFKD', text).encode('ASCII', 'ignore').decode('ASCII')
    return text

def generate_html_table(audit_data):
    if not audit_data or 'Audits' not in audit_data or 'Audit' not in audit_data['Audits']:
        logging.error('No audit data available to generate HTML table.')
        return ""

    audit_entries = audit_data['Audits']['Audit']
    if isinstance(audit_entries, dict):
        audit_entries = [audit_entries]

    html_content = """
    <html>
    <head>
        <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid black; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
        </style>
    </head>
    <body>
        <h2>Audit Data</h2>
        <table>
            <tr>
                <th>Field Name</th>
                <th>Old Value</th>
                <th>New Value</th>
                <th>UserName</th>
                <th>Changed Date and Time</th>
            </tr>
    """

    for audit in audit_entries:
        properties = audit.get('Properties', '')
        if properties:
            if isinstance(properties, str):
                properties = json.loads(properties.replace("'", '"'))
            property_data = properties.get('Property', {})
            if isinstance(property_data, dict):
                property_data = [property_data]

            for prop in property_data:
                field_name = prop.get('Label', '')
                old_value = prop.get('OldValue', '')
                new_value = prop.get('NewValue', '')
                user = audit.get('User', '')
                time = audit.get('Time', '')
                try:
                    formatted_time = datetime.strptime(time, "%Y-%m-%d %H:%M:%S").strftime("%Y-%m-%d %I:%M:%S")
                except ValueError:
                    formatted_time = time

                html_content += f"""
                <tr>
                    <td>{field_name}</td>
                    <td>{old_value}</td>
                    <td>{new_value}</td>
                    <td>{user}</td>
                    <td>{formatted_time}</td>
                </tr>
                """
        else:
            user = audit.get('User', '')
            time = audit.get('Time', '')
            try:
                formatted_time = datetime.strptime(time, "%Y-%m-%d %H:%M:%S").strftime("%Y-%m-%d %I:%M:%S")
            except ValueError:
                formatted_time = time

            html_content += f"""
            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td>{user}</td>
                <td>{formatted_time}</td>
            </tr>
            """

    html_content += """
        </table>
    </body>
    </html>
    """

    return html_content

def save_html_to_file(html_content, file_path):
    try:
        with open(file_path, 'w', encoding='utf-8') as html_file:
            html_file.write(html_content)
        logging.info(f"HTML file saved successfully to: {file_path}")
    except Exception as e:
        logging.error(f"Error saving HTML file: {str(e)}")

def write_consolidated_test_data_to_csv(all_test_data, field_mapping, csv_file_path):
    try:
        with open(csv_file_path, 'w', newline='', encoding='utf-8') as csv_file:
            if not all_test_data:
                logging.error("No test data available to write to CSV.")
                return

            # Determine all possible fields
            all_fields = set()
            for test_data in all_test_data:
                all_fields.update(test_data.keys())

            # Determine the maximum number of steps
            max_steps = max(sum(1 for key in test_data if key.startswith("Step Name")) for test_data in all_test_data)

            # Create ordered fields list
            priority_fields = ["Test ID", "Test Type", "Test Name", "Test Folder Structure", "Description", "Status"]
            step_fields = []
            for i in range(1, max_steps + 1):
                step_fields.extend([f"Step Name {i}", f"Step Description {i}", f"Step Expected Result {i}"])
            
            other_fields = [field for field in all_fields if field not in priority_fields and field not in step_fields]
            ordered_fields = priority_fields + other_fields + step_fields

            csv_writer = csv.DictWriter(csv_file, fieldnames=ordered_fields, extrasaction='ignore')
            csv_writer.writeheader()

            for test_data in all_test_data:
                csv_writer.writerow(test_data)

        logging.info(f"Consolidated test data saved to CSV successfully at: {csv_file_path}")

    except Exception as e:
        logging.error(f"Error writing test data to CSV: {str(e)}")


def main():
    alm_url = "https://quality-center.ent.cginet/qcbin"
    client_id = "apikey-jknboroghtdheeqmljls"
    secret = "dcdmjcpojljdeokm"
    domain = "DEFAULT"
    project = "Project_upload"
    folder_path = "Subject/Demo/Test"  # Specify the folder path here

    alm_client = ALMClient(alm_url, client_id, secret, domain, project)

    if alm_client.cookies:
        download_dir = "./Download"
        os.makedirs(download_dir, exist_ok=True)

        fields_data = alm_client.retrieve_test_fields()
        if fields_data:
            field_mapping = {field.get('name', ''): field.get('label', '') for field in fields_data.get('Fields', {}).get('Field', []) if isinstance(field, dict)}
            alm_client.download_tests_by_folder(folder_path, field_mapping)
        else:
            logging.error("Failed to retrieve test fields data.")
    else:
        logging.error("Authentication failed. Unable to perform further actions.")

if __name__ == "__main__":
    main()