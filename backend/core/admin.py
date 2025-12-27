from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UploadedImage


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'username', 'full_name', 'plan', 'is_staff', 'created_at']
    list_filter = ['plan', 'is_staff', 'is_active']
    search_fields = ['email', 'username', 'full_name']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Personal Info', {'fields': ('full_name', 'phone', 'location')}),
        ('Plan', {'fields': ('plan',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'full_name', 'plan'),
        }),
    )


@admin.register(UploadedImage)
class UploadedImageAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'uploaded_at', 'processed', 'processing_time_ms']
    list_filter = ['processed', 'uploaded_at']
    search_fields = ['user__email', 'user__username']
    readonly_fields = ['uploaded_at', 'processing_time_ms', 'cost_incurred']
