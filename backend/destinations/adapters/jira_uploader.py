# destinations/adapters/jira_upload.py
import requests
import json
import base64
from .base import DestinationAdapterBase

class JiraDestinationAdapter(DestinationAdapterBase):
    """
    Adapter for uploading data to Jira.
    """
    
    def validate_config(self):
        """
        Validate Jira adapter configuration.
        """
        required_fields = ['base_url', 'auth_method', 'project_key']
        
        for field in required_fields:
            if field not in self.config:
                raise ValueError(f"Missing required configuration field: {field}")
        
        # Validate URL format
        if not self.config['base_url'].startswith(('http://', 'https://')):
            raise ValueError("base_url must start with http:// or https://")
            
        # Validate auth method and required credentials
        auth_method = self.config['auth_method']
        if auth_method == 'basic':
            if 'username' not in self.config or 'password' not in self.config:
                raise ValueError("Basic authentication requires username and password")
        elif auth_method == 'token':
            if 'api_token' not in self.config:
                raise ValueError("Token authentication requires api_token")
        elif auth_method == 'oauth':
            if 'oauth_token' not in self.config:
                raise ValueError("OAuth authentication requires oauth_token")
        else:
            raise ValueError(f"Unsupported authentication method: {auth_method}")
    
    def authenticate(self):
        """
        Set up authentication for Jira based on the configured method.
        
        Returns:
            bool: True if authentication setup succeeded
        """
        self.log("Setting up Jira authentication...")
        
        auth_method = self.config['auth_method']
        self.session = requests.Session()
        
        try:
            if auth_method == 'basic':
                # For basic auth, we'll use the auth parameter in requests
                self.auth = (self.config['username'], self.config['password'])
                self.session.auth = self.auth
            elif auth_method == 'token':
                # For API token auth, we'll use the Authorization header
                token = self.config['api_token']
                self.session.headers.update({
                    'Authorization': f'Bearer {token}'
                })
            elif auth_method == 'oauth':
                # For OAuth, we'll use the Authorization header
                oauth_token = self.config['oauth_token']
                self.session.headers.update({
                    'Authorization': f'Bearer {oauth_token}'
                })
                
            # Test authentication with a simple request
            response = self.session.get(
                f"{self.config['base_url']}/rest/api/2/myself",
                verify=self.config.get('verify_ssl', True)
            )
            
            if response.status_code == 200:
                self.log("Jira authentication successful")
                return True
            else:
                self.report_error(
                    "Jira authentication failed", 
                    {"status_code": response.status_code, "response": response.text}
                )
                return False
                
        except Exception as e:
            self.report_error("Jira authentication error", {"exception": str(e)})
            return False
    
    def upload_data(self, data):
        """
        Upload data to Jira as issues.
        
        Args:
            data (list): List of data items to upload as Jira issues
            
        Returns:
            dict: Results of the upload operation with created issue keys
        """
        if not hasattr(self, 'session'):
            if not self.authenticate():
                raise Exception("Could not authenticate with Jira")
        
        self.log(f"Uploading {len(data)} items to Jira...")
        
        create_issue_url = f"{self.config['base_url']}/rest/api/2/issue"
        project_key = self.config['project_key']
        issue_type = self.config.get('issue_type', 'Bug')
        field_mapping = self.config.get('field_mapping', {})
        
        results = {
            'success_count': 0,
            'error_count': 0,
            'created_issues': [],
            'errors': []
        }
        
        for index, item in enumerate(data):
            try:
                # Map fields according to mapping configuration
                fields = {
                    'project': {'key': project_key},
                    'issuetype': {'name': issue_type},
                    'summary': self._get_mapped_value(item, field_mapping.get('summary', 'name')),
                    'description': self._get_mapped_value(item, field_mapping.get('description', 'description')),
                }
                
                # Add any additional configured field mappings
                for jira_field, source_field in field_mapping.items():
                    if jira_field not in ['summary', 'description']:
                        value = self._get_mapped_value(item, source_field)
                        if value is not None:
                            fields[jira_field] = value
                
                # Create the issue in Jira
                payload = {'fields': fields}
                
                self.log(f"Creating issue {index+1}/{len(data)}")
                response = self.session.post(
                    create_issue_url,
                    json=payload,
                    headers={'Content-Type': 'application/json'},
                    verify=self.config.get('verify_ssl', True)
                )
                
                if response.status_code in [200, 201]:
                    issue_data = response.json()
                    issue_key = issue_data.get('key')
                    self.log(f"Successfully created issue {issue_key}")
                    
                    results['created_issues'].append({
                        'key': issue_key,
                        'id': issue_data.get('id'),
                        'source_id': item.get('id')
                    })
                    results['success_count'] += 1
                else:
                    error_details = {
                        'status_code': response.status_code,
                        'response': response.text,
                        'item_index': index,
                        'item_id': item.get('id')
                    }
                    self.report_error(f"Failed to create issue for item {index}", error_details)
                    results['errors'].append(error_details)
                    results['error_count'] += 1
                    
            except Exception as e:
                error_details = {
                    'exception': str(e),
                    'item_index': index,
                    'item_id': item.get('id')
                }
                self.report_error(f"Error processing item {index}", error_details)
                results['errors'].append(error_details)
                results['error_count'] += 1
        
        self.log(f"Upload complete. Created {results['success_count']} issues with {results['error_count']} errors.")
        return results
    
    def _get_mapped_value(self, item, field_path):
        """
        Extract a value from an item based on a field path.
        
        Args:
            item (dict): The source data item
            field_path (str): Path to the field, can use dot notation for nested fields
            
        Returns:
            The value at the specified path, or None if not found
        """
        if not field_path:
            return None
            
        parts = field_path.split('.')
        value = item
        
        for part in parts:
            if isinstance(value, dict) and part in value:
                value = value[part]
            else:
                return None
                
        return value
