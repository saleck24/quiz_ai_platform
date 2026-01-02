from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    # Retirer password2 car votre front-end ne l'envoie pas
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'student_code')
        extra_kwargs = {
            'email': {'required': True},
            'student_code': {'required': False},  # Rendre optionnel
        }
    
    def validate_email(self, value):
        # Vérifier que l'email n'est pas déjà utilisé
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value
    
    def validate_username(self, value):
        # Vérifier que le username n'est pas déjà utilisé
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur est déjà pris.")
        return value
    
    def create(self, validated_data):
        # Créer l'utilisateur avec create_user
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            student_code=validated_data.get('student_code', '')
        )
        return user

# NOUVEAU : Serializer pour le login par email
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            # Trouver l'utilisateur par email
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                raise serializers.ValidationError("Invalid email or password")
            
            # Authentifier avec username (car Django auth utilise username)
            user = authenticate(username=user.username, password=password)
            
            if user:
                if not user.is_active:
                    raise serializers.ValidationError("User account is disabled")
                attrs['user'] = user
            else:
                raise serializers.ValidationError("Invalid email or password")
        else:
            raise serializers.ValidationError("Must include email and password")
        
        return attrs

# Serializer pour l'utilisateur
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'student_code', 'first_name', 'last_name')    
