# jobs/models.py
import uuid
from django.db import models
from django.db.models import JSONField
from pipelines.models import Pipeline

class Job(models.Model):
    """
    Represents a single execution of a pipeline.
    Tracks the status, logs, and results of the execution.
    """
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pipeline = models.ForeignKey(Pipeline, on_delete=models.CASCADE, related_name='jobs')
    
    # Status tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Execution metadata
    task_id = models.CharField(max_length=255, null=True, blank=True)  # Celery task ID
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Results
    source_record_count = models.IntegerField(null=True, blank=True)  # Number of records retrieved
    destination_record_count = models.IntegerField(null=True, blank=True)  # Number of records uploaded
    error_count = models.IntegerField(default=0)  # Number of errors encountered
    
    # Detailed data
    logs = models.JSONField(default=list)
    errors = models.JSONField(default=list)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Job {self.id} - {self.pipeline.name} ({self.status})"
    
    def add_log(self, message, level='info'):
        """
        Add a log message to this job.
        """
        import datetime
        log_entry = {
            'timestamp': datetime.datetime.now().isoformat(),
            'level': level,
            'message': message
        }
        self.logs.append(log_entry)
        self.save(update_fields=['logs'])
        
    def add_error(self, message, details=None):
        """
        Add an error message to this job.
        """
        import datetime
        error_entry = {
            'timestamp': datetime.datetime.now().isoformat(),
            'message': message,
            'details': details or {}
        }
        self.errors.append(error_entry)
        self.error_count += 1
        self.save(update_fields=['errors', 'error_count'])
