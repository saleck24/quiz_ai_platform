# quiz/urls.py
from django.urls import path
from .views import GenererQuizView, SoumettreReponseView, CreerSessionView, RejoindreSessionView

urlpatterns = [
    path('generer/', GenererQuizView.as_view(), name='generer-quiz'),
    path('reponse/<int:quiz_id>/<int:question_id>/', SoumettreReponseView.as_view(), name='soumettre-reponse'),
    path('session/creer/<int:quiz_id>/', CreerSessionView.as_view(), name='creer-session'),
    path('session/rejoindre/<str:token>/', RejoindreSessionView.as_view(), name='rejoindre-session'),
]
