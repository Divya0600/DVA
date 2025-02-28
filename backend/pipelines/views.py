# pipelines/views.py
from django.utils import timezone
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import Pipeline
from .serializers import PipelineSerializer, PipelineDetailSerializer
from jobs.models import Job
from jobs.tasks import execute_pipeline
from jobs.serializers import JobSummarySerializer

class PipelineViewSet(viewsets.ModelViewSet):
    """
    API viewset for managing pipelines.
    """
    queryset = Pipeline.objects.all()
    serializer_class = PipelineSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'source_type', 'destination_type']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'updated_at', 'last_run_at']
    ordering = ['-updated_at']
    
    def get_serializer_class(self):
        """
        Return different serializers based on the action.
        """
        if self.action == 'retrieve':
            return PipelineDetailSerializer
        return PipelineSerializer
    
    @action(detail=True, methods=['post'])
    def execute(self, request, pk=None):
        """
        Execute a pipeline by creating a new job.
        """
        pipeline = self.get_object()
        
        # Create a new job
        job = Job.objects.create(
            pipeline=pipeline,
            status='pending'
        )
        
        # Execute the pipeline asynchronously
        task = execute_pipeline.delay(str(pipeline.id), str(job.id))
        
        # Update the job with the task ID
        job.task_id = task.id
        job.save()
        
        # Update the pipeline's last run time
        pipeline.last_run_at = timezone.now()
        pipeline.save()
        
        return Response({
            'message': 'Pipeline execution started',
            'job_id': job.id,
            'task_id': task.id
        }, status=status.HTTP_202_ACCEPTED)
    
    @action(detail=True, methods=['get'])
    def jobs(self, request, pk=None):
        """
        Get all jobs for a specific pipeline.
        """
        pipeline = self.get_object()
        jobs = pipeline.jobs.all().order_by('-created_at')
        
        # Support pagination
        page = self.paginate_queryset(jobs)
        if page is not None:
            serializer = JobSummarySerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = JobSummarySerializer(jobs, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def types(self, request):
        """
        Get lists of available source and destination types.
        """
        # In a real implementation, this would dynamically discover
        # available adapters by inspecting the adapter directories
        
        source_types = [
            {'id': 'alm', 'name': 'ALM', 'description': 'HP ALM Defect Tracking'}
        ]
        
        destination_types = [
            {'id': 'jira', 'name': 'Jira', 'description': 'Atlassian Jira Issue Tracking'}
        ]
        
        return Response({
            'source_types': source_types,
            'destination_types': destination_types
        })
