from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from PIL import Image
from .models import UploadedImage
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from .orchestrator import Orchestrator
import time
import os

User = get_user_model()


class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'status': 'success',
                'message': 'User registered successfully',
                'data': {
                    'user': UserSerializer(user).data,
                    'tokens': {
                        'access': str(refresh.access_token),
                        'refresh': str(refresh)
                    }
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'status': 'error',
            'message': 'Registration failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'status': 'error',
                'message': 'Invalid credentials',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        try:
            user = User.objects.get(email=email)
            user = authenticate(request, username=user.username, password=password)
            
            if user is not None:
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    'status': 'success',
                    'message': 'Login successful',
                    'data': {
                        'user': UserSerializer(user).data,
                        'tokens': {
                            'access': str(refresh.access_token),
                            'refresh': str(refresh)
                        }
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'status': 'error',
                    'message': 'Invalid credentials'
                }, status=status.HTTP_401_UNAUTHORIZED)
                
        except User.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)


class DemoLoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        # Get or create demo user
        demo_email = 'demo@visionprobe.ai'
        demo_user, created = User.objects.get_or_create(
            email=demo_email,
            defaults={
                'username': 'demo_user',
                'full_name': 'Demo User',
                'plan': 'pro'
            }
        )
        
        if created:
            demo_user.set_password('demo123')
            demo_user.save()
        
        refresh = RefreshToken.for_user(demo_user)
        
        return Response({
            'status': 'success',
            'message': 'Demo login successful',
            'data': {
                'user': UserSerializer(demo_user).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh)
                }
            }
        }, status=status.HTTP_200_OK)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response({
            'status': 'success',
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    
    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'status': 'success',
                'message': 'Profile updated successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response({
            'status': 'error',
            'message': 'Update failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class AnalyzeImageView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        start_time = time.time()
        
        # 1. Validate Image Upload
        image_file = request.data.get('image')
        if not image_file:
            return Response({"error": "No image provided"}, status=status.HTTP_400_BAD_REQUEST)

        # Security Check: Size (Max 5MB)
        if image_file.size > 5 * 1024 * 1024:
             return Response({"error": "Image too large. Max size is 5MB."}, status=status.HTTP_400_BAD_REQUEST)

        # Security Check: Integrity & Format
        try:
            img = Image.open(image_file)
            img.verify() # Checks for corruption
            if img.format not in ['JPEG', 'PNG', 'WEBP']:
                 return Response({"error": "Unsupported format. Use JPEG, PNG, or WEBP."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
             return Response({"error": "Invalid image file."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Reset file pointer after verify()
        image_file.seek(0)
        
        # 2. Save Initial Record
        upload_instance = UploadedImage.objects.create(image=image_file)
        
        # 3. Trigger Orchestrator
        # Note: In production, this should be a Celery task.
        # For MVP, we run synchronously (User waits ~10-20s).
        try:
            image_path = upload_instance.image.path
            orchestrator = Orchestrator()
            report = orchestrator.process(image_path)
            
            upload_instance.analysis_report = report
            upload_instance.processed = True
        except Exception as e:
            upload_instance.analysis_report = {"error": str(e), "status": "failed"}
        
        processing_time = int((time.time() - start_time) * 1000)
        upload_instance.processing_time_ms = processing_time
        upload_instance.save()

        return Response({
            "status": "success",
            "message": "Analysis complete.",
            "data": {
                "id": upload_instance.id,
                "image_url": request.build_absolute_uri(upload_instance.image.url),
                "created_at": upload_instance.uploaded_at,
                "report": upload_instance.analysis_report
            }
        }, status=status.HTTP_201_CREATED)


class HealthCheckView(APIView):
    """Simple health check endpoint."""
    def get(self, request):
        return Response({"status": "ok", "version": "1.0.0"})
