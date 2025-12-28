from rest_framework import generics
from .serializers import RegisterSerializer
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

User = get_user_model()

class PasswordResetView(APIView):
    def post(self, request):
        email = request.data.get("email")

        try:
            user = User.objects.get(email=email)
            token = default_token_generator.make_token(user)
            uid = user.pk

            # Ici normalement tu envoies un email
            return Response({
                "message": "Password reset token generated",
                "uid": uid,
                "token": token
            })
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
class PasswordResetConfirmView(APIView):
    def post(self, request, uid, token):
        new_password = request.data.get("password")

        if not new_password:
            return Response(
                {"error": "Password is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(pk=uid)

            if default_token_generator.check_token(user, token):
                user.set_password(new_password)
                user.save()
                return Response(
                    {"message": "Password updated successfully"},
                    status=status.HTTP_200_OK
                )

            return Response(
                {"error": "Invalid or expired token"},
                status=status.HTTP_400_BAD_REQUEST
            )

        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )
class VerifyEmailView(APIView):
    def get(self, request, uid, token):
        try:
            user = User.objects.get(pk=uid)

            if default_token_generator.check_token(user, token):
                user.is_active = True
                user.save()
                return Response(
                    {"message": "Email verified successfully"},
                    status=status.HTTP_200_OK
                )

            return Response(
                {"error": "Invalid or expired token"},
                status=status.HTTP_400_BAD_REQUEST
            )

        except User.DoesNotExist:
            return Response(
                {"error": "Invalid user"},
                status=status.HTTP_404_NOT_FOUND
            )
        
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
