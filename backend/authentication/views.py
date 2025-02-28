from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff']

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request):
    """
    Get the currently authenticated user's information
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)