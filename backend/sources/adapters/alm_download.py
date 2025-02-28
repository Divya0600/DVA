# sources/adapters/alm_download.py
import requests
from .base import SourceAdapterBase

class ALMSourceAdapter(SourceAdapterBase):
    """
    Adapter for downloading data from ALM.
    """
    
    def validate_config(self):
        """
        Validate ALM adapter configuration.
        """
        required_fields = ['base_url', 'username', 'password', 'domain', 'project']
        
        for field in required_fields:
            if field not in self.config:
                raise ValueError(f"Missing required configuration field: {field}")
        
        # Validate URL format
        if not self.config['base_url'].startswith(('http://', 'https://')):
            raise ValueError("base_url must start with http:// or https://")
    
    def authenticate(self):
        """
        Authenticate with ALM using provided credentials.
        
        Returns:
            bool: True if authentication succeeded, False otherwise
        """
        self.log("Authenticating with ALM...")
        
        auth_url = f"{self.config['base_url']}/qcbin/authentication-point/authenticate"
        
        try:
            response = requests.get(
                auth_url,
                auth=(self.config['username'], self.config['password']),
                headers={"Accept": "application/xml"},
                verify=self.config.get('verify_ssl', True)
            )
            
            if response.status_code == 200:
                # Store cookies for subsequent requests
                self.session = requests.Session()
                self.session.cookies = response.cookies
                
                # Get the LWSSO cookie
                self.log("Authentication successful")
                return True
            else:
                self.report_error(
                    "ALM authentication failed", 
                    {"status_code": response.status_code, "response": response.text}
                )
                return False
                
        except Exception as e:
            self.report_error("ALM authentication error", {"exception": str(e)})
            return False
    
    def fetch_data(self):
        """
        Fetch defects data from ALM.
        
        Returns:
            list: List of defect data dictionaries
        """
        if not hasattr(self, 'session'):
            if not self.authenticate():
                raise Exception("Could not authenticate with ALM")
        
        self.log("Fetching defects from ALM...")
        
        # Construct the API endpoint for defects
        endpoint = (
            f"{self.config['base_url']}/qcbin/rest/domains/{self.config['domain']}/"
            f"projects/{self.config['project']}/defects"
        )
        
        page_size = self.config.get('page_size', 100)
        start_index = 1
        all_defects = []
        
        try:
            # Paginate through all defects
            while True:
                self.log(f"Fetching page starting at {start_index}")
                
                params = {
                    "page-size": page_size,
                    "start-index": start_index
                }
                
                # Add any filters from config
                if 'filters' in self.config:
                    for key, value in self.config['filters'].items():
                        params[key] = value
                
                response = self.session.get(
                    endpoint,
                    params=params,
                    headers={"Accept": "application/json"},
                    verify=self.config.get('verify_ssl', True)
                )
                
                if response.status_code != 200:
                    self.report_error(
                        "Failed to fetch defects", 
                        {"status_code": response.status_code, "response": response.text}
                    )
                    break
                
                data = response.json()
                defects = data.get('entities', [])
                
                if not defects:
                    break
                    
                all_defects.extend(defects)
                
                # If we got fewer than the page size, we're done
                if len(defects) < page_size:
                    break
                    
                start_index += page_size
                
            self.log(f"Successfully fetched {len(all_defects)} defects")
            return all_defects
            
        except Exception as e:
            self.report_error("Error fetching defects", {"exception": str(e)})
            raise
