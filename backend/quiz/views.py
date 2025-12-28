# quiz/views.py
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
import uuid

from .models import Quiz, Question, QuizSession
from .serializers import QuizSerializer, QuestionSerializer, QuizSessionSerializer
from notes.models import Note
from core_ia.gemini_engine import GenerateurQuiz
from core_ia.vector_store import MoteurRecherche


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
        return Response(serializer.data)


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
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, token):
        session = get_object_or_404(QuizSession, token=token)
        if session.expires_at < timezone.now():
            return Response({"error": "Session expirée"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = QuizSessionSerializer(session)
        return Response(serializer.data)
