from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from pipelines.views import PipelineViewSet
from jobs.views import JobViewSet

# Create a router and register our viewsets
router = DefaultRouter()
router.register(r'pipelines', PipelineViewSet)
router.register(r'jobs', JobViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
    
    # Include the authentication app URLs
    path('api/auth/', include('authentication.urls')),
]