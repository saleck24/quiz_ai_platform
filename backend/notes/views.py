from rest_framework import generics, permissions
from .models import Note
from .serializers import NoteSerializer
from .services.processor import process_file
from core_ia.vector_store import MoteurRecherche
from .models import Note, Chunk



class NoteUploadView(generics.CreateAPIView):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Sauvegarde et récupération de l'objet Note
        note = serializer.save(user=self.request.user)

        # Traitement du fichier uploadé
        result = process_file(note.file.path)

        # sauvegarde des chunks
        for i, chunk in enumerate(result["chunks"]):
            Chunk.objects.create(note=note, content=chunk, index=i)

        # --- STOCKER DANS LE MOTEUR RAG ---
        moteur = MoteurRecherche()
        moteur.stocker_extraits(result["chunks"])

class NoteListView(generics.ListAPIView):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # L'utilisateur ne voit que ses propres notes
        return Note.objects.filter(user=self.request.user)
