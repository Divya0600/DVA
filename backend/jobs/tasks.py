# jobs/tasks.py
import datetime
from celery import shared_task
from django.utils import timezone

from pipelines.models import Pipeline
from jobs.models import Job

@shared_task(bind=True, max_retries=3)
def execute_pipeline(self, pipeline_id, job_id=None):
    """
    Execute a pipeline by fetching data from the source
    and uploading it to the destination.
    
    Args:
        pipeline_id (str): UUID of the pipeline to execute
        job_id (str, optional): UUID of an existing job, 
                                or None to create a new job
    
    Returns:
        dict: Results of the job execution
    """
    # Get the pipeline
    try:
        pipeline = Pipeline.objects.get(pk=pipeline_id)
    except Pipeline.DoesNotExist:
        return {
            'status': 'failed',
            'error': f'Pipeline with ID {pipeline_id} does not exist'
        }
    
    # Get or create the job
    if job_id:
        try:
            job = Job.objects.get(pk=job_id)
        except Job.DoesNotExist:
            return {
                'status': 'failed',
                'error': f'Job with ID {job_id} does not exist'
            }
    else:
        job = Job.objects.create(
            pipeline=pipeline,
            task_id=self.request.id,
            status='pending'
        )
    
    # Update job and pipeline status
    job.status = 'running'
    job.started_at = timezone.now()
    job.save()
    
    pipeline.status = 'active'
    pipeline.last_run_at = timezone.now()
    pipeline.save()
    
    job.add_log("Pipeline execution started")
    
    try:
        # Get the source adapter
        job.add_log("Initializing source adapter")
        source_adapter = pipeline.get_source_adapter(job)
        
        # Get the destination adapter
        job.add_log("Initializing destination adapter")
        destination_adapter = pipeline.get_destination_adapter(job)
        
        # Fetch data from source
        job.add_log("Fetching data from source")
        source_data = source_adapter.fetch_data()
        
        if not source_data:
            job.add_log("No data received from source", level="warning")
            job.status = 'completed'
            job.completed_at = timezone.now()
            job.source_record_count = 0
            job.destination_record_count = 0
            job.save()
            
            return {
                'status': 'completed',
                'message': 'No data to process'
            }
        
        job.source_record_count = len(source_data)
        job.save()
        
        # Apply transformations if configured
        if pipeline.transformation_config:
            job.add_log("Applying data transformations")
            # To be implemented - apply transformation rules
        
        # Upload data to destination
        job.add_log(f"Uploading {len(source_data)} records to destination")
        upload_results = destination_adapter.upload_data(source_data)
        
        # Update job status
        job.destination_record_count = upload_results.get('success_count', 0)
        job.error_count = upload_results.get('error_count', 0)
        job.status = 'completed'
        job.completed_at = timezone.now()
        job.save()
        
        job.add_log(
            f"Pipeline execution completed: {job.destination_record_count} records uploaded, "
            f"{job.error_count} errors"
        )
        
        # Update pipeline status
        pipeline.status = 'active'
        pipeline.save()
        
        return {
            'status': 'completed',
            'job_id': str(job.id),
            'source_count': job.source_record_count,
            'destination_count': job.destination_record_count,
            'error_count': job.error_count
        }
        
    except Exception as e:
        # Handle and log any exceptions
        job.status = 'failed'
        job.completed_at = timezone.now()
        job.save()
        
        error_message = f"Pipeline execution failed: {str(e)}"
        job.add_error(error_message)
        
        # Update pipeline status if this was a pipeline error
        pipeline.status = 'error'
        pipeline.save()
        
        # Retry the task if appropriate
        if self.request.retries < self.max_retries:
            raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))
            
        return {
            'status': 'failed',
            'error': error_message,
            'job_id': str(job.id)
        }
