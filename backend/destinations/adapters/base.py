# destinations/adapters/base.py
from abc import ABC, abstractmethod

class DestinationAdapterBase(ABC):
    """
    Abstract base class for all destination adapters.
    
    Destination adapters are responsible for connecting to a destination system,
    authenticating, and uploading data.
    """
    
    def __init__(self, config, job=None):
        """
        Initialize the adapter with configuration.
        
        Args:
            config (dict): Configuration parameters for this adapter
            job (Job, optional): Job instance for logging
        """
        self.config = config
        self.job = job
        self.validate_config()
        
    @abstractmethod
    def validate_config(self):
        """
        Validate that the provided configuration has all required fields.
        Should raise ValueError if configuration is invalid.
        """
        pass
    
    @abstractmethod
    def authenticate(self):
        """
        Authenticate with the destination system.
        
        Returns:
            bool: True if authentication was successful, False otherwise
        """
        pass
    
    @abstractmethod
    def upload_data(self, data):
        """
        Upload data to the destination system.
        
        Args:
            data (list): The data to upload
            
        Returns:
            dict: Results of the upload operation
        """
        pass
    
    @abstractmethod
    def test_connection(self):
        """
        Test connection to the destination system.
        This method is used for validating credentials before setting up the pipeline.
        
        Returns:
            dict: Connection test results with status and message
        """
        pass
    
    def log(self, message, level='info'):
        """
        Log a message to the job if available.
        """
        if self.job:
            self.job.add_log(message, level)
        # Could also add standard logging here
        
    def report_error(self, message, details=None):
        """
        Report an error to the job if available.
        """
        if self.job:
            self.job.add_error(message, details)
        # Could also add standard error logging here
