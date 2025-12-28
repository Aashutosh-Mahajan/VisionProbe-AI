from django.urls import path
from .views import (
    AnalyzeImageView, 
    HealthCheckView,
    RegisterView,
    LoginView,
    DemoLoginView,
    ProfileView,
    ProductChatView
)

urlpatterns = [
    # Analysis
    path('analyze/', AnalyzeImageView.as_view(), name='analyze_image'),
    path('health/', HealthCheckView.as_view(), name='health_check'),
    path('chat/', ProductChatView.as_view(), name='product_chat'),
    
    # Authentication
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/demo-login/', DemoLoginView.as_view(), name='demo_login'),
    path('auth/profile/', ProfileView.as_view(), name='profile'),
]
