from django.urls import path
from .views import RegisterView ,PasswordResetView, PasswordResetConfirmView, VerifyEmailView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView 


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('password-reset/', PasswordResetView.as_view(), name='password_reset'),
    path('password-reset-confirm/<int:uid>/<str:token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('verify-email/<int:uid>/<str:token>/', VerifyEmailView.as_view(), name='verify_email'),
]
