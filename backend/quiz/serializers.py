# quiz/serializers.py
from rest_framework import serializers
from .models import Quiz, Question, QuizSession

# ----------------- Question -----------------
class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'question', 'options', 'reponse', 'explication', 'niveau']

# ----------------- Quiz -----------------
class QuizSerializer(serializers.ModelSerializer):
    # On inclut les questions associées pour retourner tout le quiz
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'note', 'user', 'niveau', 'type_quiz', 'created_at', 'questions']

# ----------------- QuizSession -----------------
class QuizSessionSerializer(serializers.ModelSerializer):
    quiz = QuizSerializer(read_only=True)
    views_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = QuizSession
        fields = ['id', 'quiz', 'token', 'expires_at', 'views_count']
