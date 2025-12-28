from django.urls import path
from .views import NoteUploadView, NoteListView

urlpatterns = [
    path('upload/', NoteUploadView.as_view(), name='note_upload'),
    path('list/', NoteListView.as_view(), name='note_list'),
]
