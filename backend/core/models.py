from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """Extended User model with additional fields"""
    email = models.EmailField(_('email address'), unique=True)
    full_name = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=100, blank=True)
    plan = models.CharField(max_length=20, default='free', choices=[
        ('free', 'Free'),
        ('pro', 'Pro'),
        ('enterprise', 'Enterprise')
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email


class UploadedImage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='images', null=True, blank=True)
    image = models.ImageField(upload_to='uploads/%Y/%m/%d/', null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    processed = models.BooleanField(default=False)
    
    # We will store the full JSON report here
    analysis_report = models.JSONField(blank=True, null=True)
    
    # Metadata for cost and performance tracking
    cost_incurred = models.DecimalField(max_digits=10, decimal_places=4, default=0.0000)
    processing_time_ms = models.IntegerField(default=0)

    def __str__(self):
        return f"Image {self.id} - {self.uploaded_at.strftime('%Y-%m-%d %H:%M')}"
