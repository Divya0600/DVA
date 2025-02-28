# jobs/serializers.py
from rest_framework import serializers
from .models import Job

class JobSummarySerializer(serializers.ModelSerializer):
    """
    Simplified serializer for Job model, used in lists and summaries.
    """
    pipeline_name = serializers.CharField(source='pipeline.name', read_only=True)
    duration = serializers.SerializerMethodField()
    
    class Meta:
        model = Job
        fields = [
            'id', 'pipeline', 'pipeline_name', 'status', 'started_at', 
            'completed_at', 'duration', 'source_record_count', 
            'destination_record_count', 'error_count', 'created_at'
        ]
        read_only_fields = fields
    
    def get_duration(self, obj):
        """Calculate the job duration in seconds."""
        if obj.started_at and obj.completed_at:
            return (obj.completed_at - obj.started_at).total_seconds()
        return None

class JobDetailSerializer(JobSummarySerializer):
    """
    Detailed serializer for Job model including logs and errors.
    """
    pipeline_source_type = serializers.CharField(source='pipeline.source_type', read_only=True)
    pipeline_destination_type = serializers.CharField(source='pipeline.destination_type', read_only=True)
    
    class Meta(JobSummarySerializer.Meta):
        fields = JobSummarySerializer.Meta.fields + [
            'task_id', 'logs', 'errors', 'pipeline_source_type', 
            'pipeline_destination_type'
        ]
