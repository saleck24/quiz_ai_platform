# quiz/urls.py
from django.urls import path
from .views import GenererQuizView, SoumettreReponseView, CreerSessionView, RejoindreSessionView, StatsView, QuizDetailView, QuizListView, SessionListView, SessionDeleteView

urlpatterns = [
    path('generer/', GenererQuizView.as_view(), name='generer-quiz'),
    path('list/', QuizListView.as_view(), name='quiz-list'),
    path('<int:id>/', QuizDetailView.as_view(), name='quiz-detail'),
    path('reponse/<int:quiz_id>/<int:question_id>/', SoumettreReponseView.as_view(), name='soumettre-reponse'),
    path('session/creer/<int:quiz_id>/', CreerSessionView.as_view(), name='creer-session'),
    path('session/rejoindre/<str:token>/', RejoindreSessionView.as_view(), name='rejoindre-session'),
    path('session/list/', SessionListView.as_view(), name='session-list'),
    path('session/supprimer/<int:id>/', SessionDeleteView.as_view(), name='session-delete'),
    path('stats/', StatsView.as_view(), name='quiz-stats'),
]
