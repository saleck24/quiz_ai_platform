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
    note_title = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = ['id', 'note', 'user', 'niveau', 'type_quiz', 'created_at', 'questions', 'note_title']

    def get_note_title(self, obj):
        import os
        if obj.note and obj.note.file and obj.note.file.name:
            return os.path.basename(obj.note.file.name)
        return f"Quiz #{obj.id}"

# ----------------- QuizSession -----------------
class QuizSessionSerializer(serializers.ModelSerializer):
    quiz = QuizSerializer(read_only=True)
    views_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = QuizSession
        fields = ['id', 'quiz', 'token', 'expires_at', 'views_count']
