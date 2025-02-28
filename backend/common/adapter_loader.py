# common/adapter_loader.py
import importlib
import inspect

def load_source_adapter(adapter_type, config, job=None):
    """
    Dynamically load and instantiate a source adapter.
    
    Args:
        adapter_type (str): The type of adapter to load (e.g., 'alm')
        config (dict): Configuration for the adapter
        job (Job, optional): Job instance for logging
        
    Returns:
        SourceAdapterBase: An instance of the requested adapter
        
    Raises:
        ImportError: If the adapter module cannot be imported
        ValueError: If the adapter class cannot be found in the module
    """
    try:
        # Import the module dynamically
        module_path = f"sources.adapters.{adapter_type}_download"
        module = importlib.import_module(module_path)
        
        # Find the adapter class in the module
        for name, obj in inspect.getmembers(module, inspect.isclass):
            if name.endswith('SourceAdapter') and name != 'SourceAdapterBase':
                adapter_class = obj
                return adapter_class(config, job)
                
        raise ValueError(f"Could not find adapter class in module {module_path}")
        
    except ImportError as e:
        if job:
            job.add_error(f"Could not import adapter module: {module_path}", {"exception": str(e)})
        raise ImportError(f"Source adapter '{adapter_type}' not found. Error: {str(e)}")

def load_destination_adapter(adapter_type, config, job=None):
    """
    Dynamically load and instantiate a destination adapter.
    
    Args:
        adapter_type (str): The type of adapter to load (e.g., 'jira')
        config (dict): Configuration for the adapter
        job (Job, optional): Job instance for logging
        
    Returns:
        DestinationAdapterBase: An instance of the requested adapter
        
    Raises:
        ImportError: If the adapter module cannot be imported
        ValueError: If the adapter class cannot be found in the module
    """
    try:
        # Import the module dynamically
        module_path = f"destinations.adapters.{adapter_type}_upload"
        module = importlib.import_module(module_path)
        
        # Find the adapter class in the module
        for name, obj in inspect.getmembers(module, inspect.isclass):
            if name.endswith('DestinationAdapter') and name != 'DestinationAdapterBase':
                adapter_class = obj
                return adapter_class(config, job)
                
        raise ValueError(f"Could not find adapter class in module {module_path}")
        
    except ImportError as e:
        if job:
            job.add_error(f"Could not import adapter module: {module_path}", {"exception": str(e)})
        raise ImportError(f"Destination adapter '{adapter_type}' not found. Error: {str(e)}")
