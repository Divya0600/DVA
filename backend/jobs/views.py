# jobs/views.py
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from celery.result import AsyncResult

from .models import Job
from .serializers import JobSummarySerializer, JobDetailSerializer
from .tasks import execute_pipeline

class JobViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API viewset for job management.
    """
    queryset = Job.objects.all()
    serializer_class = JobSummarySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'pipeline']
    search_fields = ['pipeline__name']
    ordering_fields = ['created_at', 'started_at', 'completed_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """
        Return different serializers based on the action.
        """
        if self.action == 'retrieve':
            return JobDetailSerializer
        return JobSummarySerializer
    
    @action(detail=True, methods=['post'])
    def retry(self, request, pk=None):
        """
        Retry a failed job.
        """
        job = self.get_object()
        
        # Check if job can be retried
        if job.status != 'failed':
            return Response({
                'message': 'Only failed jobs can be retried'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update job status
        job.status = 'pending'
        job.save()
        
        # Execute the pipeline asynchronously
        task = execute_pipeline.delay(str(job.pipeline.id), str(job.id))
        
        # Update the job with the new task ID
        job.task_id = task.id
        job.save()
        
        return Response({
            'message': 'Job retry started',
            'job_id': job.id,
            'task_id': task.id
        }, status=status.HTTP_202_ACCEPTED)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancel a running or pending job.
        """
        job = self.get_object()
        
        # Check if job can be cancelled
        if job.status not in ['pending', 'running']:
            return Response({
                'message': 'Only pending or running jobs can be cancelled'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Attempt to revoke the task
        if job.task_id:
            AsyncResult(job.task_id).revoke(terminate=True)
        
        # Update job status
        job.status = 'cancelled'
        job.save()
        
        return Response({
            'message': 'Job cancelled',
            'job_id': job.id
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):
        """
        Get the current status of a job, including Celery task status.
        """
        job = self.get_object()
        task_status = None
        
        # Get Celery task status if available
        if job.task_id:
            task_result = AsyncResult(job.task_id)
            task_status = {
                'task_id': job.task_id,
                'state': task_result.state,
                'info': task_result.info
            }
        
        serializer = JobDetailSerializer(job)
        return Response({
            'job': serializer.data,
            'task': task_status
        })
