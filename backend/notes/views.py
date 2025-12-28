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

        # Pour l’instant on affiche juste dans la console
        print("TEXT:", result["text"][:500])
        print("CHUNKS:", len(result["chunks"]))
        
        # sauvegarde des chunks
        for i, chunk in enumerate(result["chunks"]):
            Chunk.objects.create(note=note, content=chunk, index=i)

        # --- STOCKER DANS LE MOTEUR RAG ---
        moteur = MoteurRecherche()
        moteur.stocker_extraits(result["chunks"])
        print("Titres disponibles :", moteur.obtenir_liste_titres())

class NoteListView(generics.ListAPIView):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # L'utilisateur ne voit que ses propres notes
        return Note.objects.filter(user=self.request.user)
