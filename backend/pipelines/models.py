# pipelines/models.py
import uuid
from django.db import models
from django.db.models import JSONField

class Pipeline(models.Model):
    """
    Represents a data pipeline configuration that connects a source to a destination.
    """
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('error', 'Error'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    
    # Source configuration
    source_type = models.CharField(max_length=100)
    source_config = models.JSONField(default=dict)




    
    # Destination configuration
    destination_type = models.CharField(max_length=100)
    destination_config = models.JSONField(default=dict)
    
    # Pipeline settings
    schedule = models.CharField(max_length=100, blank=True, null=True)  # Cron expression for scheduled runs
    transformation_config = models.JSONField(default=dict, blank=True)
    
    # Status and metadata
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='inactive')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_run_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-updated_at']
        
    def __str__(self):
        return f"{self.name} ({self.source_type} → {self.destination_type})"
    
    def get_source_adapter(self, job=None):
        """
        Dynamically load and instantiate the source adapter.
        """
        from common.adapter_loader import load_source_adapter
        return load_source_adapter(self.source_type, self.source_config, job)
    
    def get_destination_adapter(self, job=None):
        """
        Dynamically load and instantiate the destination adapter.
        """
        from common.adapter_loader import load_destination_adapter
        return load_destination_adapter(self.destination_type, self.destination_config, job)
