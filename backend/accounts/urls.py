from django.urls import path
from .views import (
    RegisterView, 
    CustomLoginView, 
    CustomTokenRefreshView,
    UserProfileView,
    PasswordResetView, 
    PasswordResetConfirmView, 
    VerifyEmailView
)
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomLoginView.as_view(), name='login'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    # ROUTES EXISTANTES (pour compatibilité)
    path('token/', CustomLoginView.as_view(), name='token_obtain_pair'),  # Alias pour login
    
    # Utilisateur
    path('profile/', UserProfileView.as_view(), name='profile'),  # ← NOUVELLE ROUTE
    
    # Password reset
    path('password-reset/', PasswordResetView.as_view(), name='password_reset'),
    path('password-reset-confirm/<int:uid>/<str:token>/', 
         PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('verify-email/<int:uid>/<str:token>/', 
         VerifyEmailView.as_view(), name='verify_email'),
]
