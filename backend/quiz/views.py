# quiz/views.py
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
import uuid

from .models import Quiz, Question, QuizSession
from .serializers import QuizSerializer, QuizListSerializer, QuestionSerializer, QuizSessionSerializer
from notes.models import Note
from core_ia.gemini_engine import GenerateurQuiz
from core_ia.vector_store import MoteurRecherche
import os


# ----------------- GENERER UN QUIZ -----------------
class GenererQuizView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        note_id = request.data.get("note_id")
        nb_questions = int(request.data.get("nb_questions", 5))
        niveau = request.data.get("niveau", "Facile")
        type_quiz = request.data.get("type_quiz", "QCM")

        # Vérification de la note
        note = get_object_or_404(Note, id=note_id, user=request.user)
        chunks = [c.content for c in note.chunks.all()]

        if not chunks:
            return Response({"error": "Cette note ne contient aucun contenu."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Initialisation moteur RAG et générateur IA
        moteur = MoteurRecherche()
        moteur.stocker_extraits(chunks)
        gen = GenerateurQuiz()

        # Création du quiz
        quiz = Quiz.objects.create(note=note, user=request.user,
                                   niveau=1, type_quiz=type_quiz)

        questions_creees = []
        for _ in range(nb_questions):
            contexte = moteur.chercher_contexte()
            print("Contexte choisi:", contexte)
            q_data = gen.generer_question_unique(contexte, niveau)
            print("Données générées:", q_data)
            if q_data:
                print("Création question...")
                question = Question.objects.create(
                    quiz=quiz,
                    question=q_data['question'],
                    options=q_data['options'],
                    reponse=q_data['reponse'],
                    explication=q_data['explication'],
                    niveau=1
                )
                questions_creees.append(question)

        serializer = QuizSerializer(quiz)
        serializer = QuizSerializer(quiz)
        return Response(serializer.data)


# ----------------- LISTER LES QUIZ DE L'UTILISATEUR -----------------
class QuizListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = QuizListSerializer

    def get_queryset(self):
        print(f"DEBUG: QuizListView hit by user {self.request.user}")
        return Quiz.objects.filter(user=self.request.user).order_by('-created_at')


# ----------------- RECUPERER UN QUIZ EXISTANT -----------------
class QuizDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = QuizSerializer
    lookup_field = 'id'

    def get_queryset(self):
        return Quiz.objects.filter(user=self.request.user)


# ----------------- SOUMETTRE UNE REPONSE -----------------
class SoumettreReponseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, quiz_id, question_id):
        quiz = get_object_or_404(Quiz, id=quiz_id, user=request.user)
        question = get_object_or_404(Question, id=question_id, quiz=quiz)
        reponse_user = request.data.get("reponse")

        correct = (reponse_user.upper() == question.reponse.upper())
        feedback = question.explication

        # Gestion adaptative du niveau
        if not hasattr(quiz, 'good_answers'):
            quiz.good_answers = 0
            quiz.bad_answers = 0

        if correct:
            quiz.good_answers += 1
            quiz.bad_answers = 0
            if quiz.good_answers >= 3:
                quiz.niveau += 1
                quiz.good_answers = 0
        else:
            quiz.bad_answers += 1
            quiz.good_answers = 0
            if quiz.bad_answers >= 2:
                quiz.niveau = max(1, quiz.niveau - 1)
                quiz.bad_answers = 0

        quiz.save()

        return Response({
            "correct": correct,
            "feedback": feedback,
            "niveau_actuel": quiz.niveau
        })


# ----------------- CREER UNE SESSION TEMPORAIRE -----------------
class CreerSessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, quiz_id):
        quiz = get_object_or_404(Quiz, id=quiz_id, user=request.user)
        token = str(uuid.uuid4())
        expires_at = timezone.now() + timedelta(hours=1)

        session = QuizSession.objects.create(
            quiz=quiz,
            token=token,
            expires_at=expires_at
        )
        serializer = QuizSessionSerializer(session)
        return Response(serializer.data)


# ----------------- REJOINDRE UNE SESSION -----------------
class RejoindreSessionView(APIView):
    permission_classes = [permissions.AllowAny]  # Token dans l'URL = accès public

    def get(self, request, token):
        session = get_object_or_404(QuizSession, token=token)
        if session.expires_at < timezone.now():
            return Response({"error": "Session expirée"}, status=status.HTTP_400_BAD_REQUEST)

        # Incrémenter le compteur de vues
        session.views_count += 1
        session.save()

        serializer = QuizSessionSerializer(session)
        return Response(serializer.data)


# ----------------- LISTER LES SESSIONS -----------------
class SessionListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = QuizSessionSerializer

    def get_queryset(self):
        # On filtre les sessions dont le quiz appartient à l'utilisateur
        return QuizSession.objects.filter(quiz__user=self.request.user).order_by('-expires_at')


# ----------------- SUPPRIMER UNE SESSION -----------------
class SessionDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return QuizSession.objects.filter(quiz__user=self.request.user)


# ----------------- DASHBOARD STATS -----------------
class StatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # 1. Nombre de documents
        docs_count = Note.objects.filter(user=user).count()
        
        # 2. Nombre de quiz commencés/générés
        quiz_count = Quiz.objects.filter(user=user).count()
        
        # 3. Score moyen (Placeholder car pas de modèle Score pour l'instant)
        # On pourrait imaginer une moyenne basée sur le niveau atteint
        avg_score = 0
        if quiz_count > 0:
            # Exemple simple : on suppose que chaque niveau vaut 20% (niveau 5 = 100%)
            avg_lvl = 0
            quizzes = Quiz.objects.filter(user=user)
            for q in quizzes:
                avg_lvl += q.niveau
            
            avg_score = int((avg_lvl / quiz_count) * 20)
            avg_score = min(100, avg_score)

        # 4. Activité Récente (Fusion Notes + Quiz)
        # 4. Activité Récente (Fusion Notes + Quiz)
        recent_activity = []

        try:
            # Récupérer les 5 dernières notes
            recent_notes = Note.objects.filter(user=user).order_by('-uploaded_at')[:5]
            for n in recent_notes:
                filename = "Document"
                if n.file and n.file.name:
                    filename = os.path.basename(n.file.name)
                
                recent_activity.append({
                    "type": "note",
                    "action": "Uploaded",
                    "subject": filename,
                    "timestamp": n.uploaded_at,
                    "score": None
                })

            # Récupérer les 5 derniers quiz
            recent_quizzes = Quiz.objects.filter(user=user).order_by('-created_at')[:5]
            for q in recent_quizzes:
                # On estime un score affichable basé sur le niveau (juste pour l'UI)
                display_score = f"{min(100, q.niveau * 20)}%" 
                note_title = "Quiz"
                if q.note and q.note.file and q.note.file.name:
                     note_title = os.path.basename(q.note.file.name)
                
                recent_activity.append({
                    "type": "quiz",
                    "action": "Generated Quiz",
                    "subject": note_title,
                    "timestamp": q.created_at,
                    "score": display_score
                })

            # Trier par date décroissante
            recent_activity.sort(key=lambda x: x['timestamp'], reverse=True)
            # Garder les 5 premiers
            recent_activity = recent_activity[:5]
        except Exception as e:
            print(f"Error calculating recent activity: {e}")
            # On continue sans activité récente plutôt que de planter
            recent_activity = []

        return Response({
            "documents": docs_count,
            "quizzesTaken": quiz_count,
            "averageScore": avg_score,
            "studyTime": "0h", # Remplacement de N/A par 0h pour faire plus propre
            "recentActivity": recent_activity
        })
