# quiz/models.py
from django.db import models
from django.contrib.auth import get_user_model
from notes.models import Note
import uuid
from django.utils import timezone
from datetime import timedelta


def get_expiration_time():
    return timezone.now() + timedelta(hours=1)

User = get_user_model()

class Quiz(models.Model):
    note = models.ForeignKey(Note, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    niveau = models.IntegerField(default=1)
    type_quiz = models.CharField(max_length=10, choices=[("QCM","QCM"),("Mixte","Mixte")])
    created_at = models.DateTimeField(auto_now_add=True)

class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="questions")
    question = models.TextField()
    options = models.JSONField()
    reponse = models.CharField(max_length=1)
    explication = models.TextField()
    niveau = models.IntegerField(default=1)

class QuizSession(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    token = models.CharField(max_length=100, unique=True, default=uuid.uuid4)
    expires_at = models.DateTimeField(default=get_expiration_time)
