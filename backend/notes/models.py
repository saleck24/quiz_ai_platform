from django.db import models
from django.conf import settings

def notes_upload_to(instance, filename):
    # Les fichiers seront stockés dans MEDIA_ROOT/notes/<user_id>/<filename>
    return f'notes/{instance.user.id}/{filename}'

class Note(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notes'
    )
    file = models.FileField(upload_to=notes_upload_to)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.file.name} ({self.user.username})"

class Chunk(models.Model):
    note = models.ForeignKey(Note, on_delete=models.CASCADE, related_name='chunks')
    content = models.TextField()
    index = models.PositiveIntegerField()  # position du chunk dans le texte
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Chunk {self.index} for Note {self.note.id}"