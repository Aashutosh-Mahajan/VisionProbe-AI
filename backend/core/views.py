from typing import Optional

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from PIL import Image
from .models import UploadedImage
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from .orchestrator import Orchestrator
from .web_extract import fetch_url_html, extract_main_image_from_html
from .agents import ProductChatAgent
import time
import os
import json
import re
from urllib.parse import urlparse, urlunparse, parse_qsl, urlencode

User = get_user_model()

_TRACKING_PARAM_KEYS = {
    'fbclid',
    'gclid',
    'mkt_tok',
    'mc_cid',
    'mc_eid',
    'ref_src',
    'ref',
    'scid',
    'msclkid',
    'dclid',
    'yclid',
    'spm',
    'affid',
    'trackingid'
}

_TRACKING_PARAM_PREFIXES = (
    'utm_',
    'utm-',
    'ref_',
    'trk_',
    'ga_',
    'fb_',
    'mc_',
    'sc_',
    'amp_'
)

def _is_tracking_param(name: str) -> bool:
    if not name:
        return False
    lower = name.lower()
    if lower in _TRACKING_PARAM_KEYS:
        return True
    return any(lower.startswith(prefix) for prefix in _TRACKING_PARAM_PREFIXES)

def _sanitize_product_url(raw_url: str) -> Optional[str]:
    if not raw_url:
        return None
    candidate = raw_url.strip()
    if not candidate:
        return None
    if not candidate.lower().startswith(('http://', 'https://')):
        candidate = 'https://' + candidate
    try:
        parsed = urlparse(candidate)
    except Exception:
        return candidate

    if not parsed.scheme:
        parsed = parsed._replace(scheme='https')

    query_pairs = parse_qsl(parsed.query or '', keep_blank_values=True)
    filtered_pairs = [
        (key, value)
        for key, value in query_pairs
        if not _is_tracking_param(key)
    ]
    sanitized = parsed._replace(query=urlencode(filtered_pairs, doseq=True), fragment='')
    final = urlunparse(sanitized)
    return final.rstrip('?')


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
    permission_classes = [AllowAny]  # Auth handled by Neon Auth on frontend
    parser_classes = (MultiPartParser, FormParser, JSONParser)  # Support both FormData and JSON

    def _parse_product_urls(self, raw):
        if not raw:
            return []
        
        # Already a list (from JSON parser)
        if isinstance(raw, (list, tuple)):
            raw_list = [str(u).strip() for u in raw if str(u).strip()]
        # String (from FormData) - try to parse as JSON first
        elif isinstance(raw, str):
            raw_list = []
            try:
                parsed = json.loads(raw)
                if isinstance(parsed, list):
                    raw_list = [str(u).strip() for u in parsed if str(u).strip()]
            except Exception:
                pass

            if not raw_list:
                # Fallback: split on newlines or commas only (not spaces - URLs have params)
                raw_list = [p.strip() for p in re.split(r"\r?\n|,", raw) if p.strip()]

            # Ultimate fallback: treat the entire raw as one URL
            if not raw_list:
                raw_list = [raw.strip()]
        else:
            raw_list = [str(raw).strip()]

        sanitized_urls = []
        seen = set()
        for entry in raw_list:
            if not entry:
                continue
            cleaned = _sanitize_product_url(entry)
            if not cleaned or cleaned in seen:
                continue
            seen.add(cleaned)
            sanitized_urls.append(cleaned)
        return sanitized_urls

    def post(self, request, *args, **kwargs):
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"[ANALYZE] Request received: content_type={request.content_type}, has_image={'image' in request.data}, data_keys={list(request.data.keys())}")
        
        start_time = time.time()

        # Optional: product URLs provided by user
        product_urls = self._parse_product_urls(request.data.get('product_urls'))
        logger.info(f"[ANALYZE] Parsed {len(product_urls)} product URLs")
        
        # 1. Validate Image Upload (optional if URLs provided)
        image_file = request.data.get('image')
        if not image_file and not product_urls:
            logger.warning("[ANALYZE] No image or URLs provided")
            return Response({"error": "Provide an image or product URLs"}, status=status.HTTP_400_BAD_REQUEST)

        # Security Check: Size (Max 5MB) - only if image provided
        if image_file:
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
        # Try to fetch a representative product image from provided URLs when no file uploaded
        fetched_image_url = None
        if not image_file and product_urls:
            for u in product_urls:
                try:
                    html = fetch_url_html(u)
                    if not html:
                        continue
                    img = extract_main_image_from_html(html, base_url=u)
                    if img:
                        fetched_image_url = img
                        break
                except Exception:
                    continue

        upload_instance = UploadedImage.objects.create(image=image_file) if image_file else UploadedImage.objects.create()
        
        # 3. Trigger Orchestrator
        # Note: In production, this should be a Celery task.
        # For MVP, we run synchronously (User waits ~10-20s).
        try:
            if image_file:
                image_path = upload_instance.image.path
            else:
                # If we fetched an image URL from the product page, pass it to the orchestrator
                image_path = fetched_image_url if fetched_image_url else None
            orchestrator = Orchestrator()
            report = orchestrator.process(image_path, product_urls=product_urls)
            
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
                "image_url": request.build_absolute_uri(upload_instance.image.url) if image_file else fetched_image_url,
                "created_at": upload_instance.uploaded_at,
                "report": upload_instance.analysis_report
            }
        }, status=status.HTTP_201_CREATED)


class HealthCheckView(APIView):
    """Simple health check endpoint."""
    def get(self, request):
        return Response({"status": "ok", "version": "1.0.0"})


class ProductChatView(APIView):
    # Allow analysis results to trigger chat even when the JWT token is missing
    # since the dashboard already guards the UI with Neon auth.
    permission_classes = [AllowAny]

    def post(self, request):
        message = (request.data.get('message') or '').strip()
        report_context = request.data.get('report_context')
        if not message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)
        if report_context is None:
            return Response({"error": "report_context is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            agent = ProductChatAgent()
            answer = agent.run(message=message, report_context=report_context)
            return Response({"status": "success", "data": {"answer": answer}}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
