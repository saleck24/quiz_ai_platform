from rest_framework import serializers
from .models import Note

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'user', 'file', 'uploaded_at']
        read_only_fields = ['id', 'user', 'uploaded_at']
