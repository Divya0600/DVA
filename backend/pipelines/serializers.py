# pipelines/serializers.py
from rest_framework import serializers
from .models import Pipeline
from jobs.models import Job

class PipelineSerializer(serializers.ModelSerializer):
    """
    Serializer for Pipeline model with job count and latest job status.
    """
    job_count = serializers.SerializerMethodField()
    latest_job_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Pipeline
        fields = [
            'id', 'name', 'description', 'source_type', 'source_config',
            'destination_type', 'destination_config', 'schedule',
            'transformation_config', 'status', 'created_at', 'updated_at', 
            'last_run_at', 'job_count', 'latest_job_status'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_run_at']
    
    def get_job_count(self, obj):
        """Get the total number of jobs for this pipeline."""
        return obj.jobs.count()
    
    def get_latest_job_status(self, obj):
        """Get the status of the most recent job."""
        latest_job = obj.jobs.order_by('-created_at').first()
        if latest_job:
            return latest_job.status
        return None
    
    def validate(self, data):
        """
        Additional validation for pipeline configuration.
        """
        # Validate source configuration
        source_type = data.get('source_type')
        source_config = data.get('source_config', {})
        
        if not source_type:
            raise serializers.ValidationError("Source type is required")
        
        # Validate destination configuration
        destination_type = data.get('destination_type')
        destination_config = data.get('destination_config', {})
        
        if not destination_type:
            raise serializers.ValidationError("Destination type is required")
        
        # Additional validation could be added here, such as trying to load
        # the adapters to validate configuration before saving
        
        return data

class PipelineDetailSerializer(PipelineSerializer):
    """
    Detailed serializer for Pipeline model including recent jobs.
    """
    recent_jobs = serializers.SerializerMethodField()
    
    class Meta(PipelineSerializer.Meta):
        fields = PipelineSerializer.Meta.fields + ['recent_jobs']
    
    def get_recent_jobs(self, obj):
        """Get the 5 most recent jobs for this pipeline."""
        recent_jobs = obj.jobs.order_by('-created_at')[:5]
        from jobs.serializers import JobSummarySerializer
        return JobSummarySerializer(recent_jobs, many=True).data
