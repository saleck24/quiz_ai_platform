# 🧠 Quiz AI Platform

![Python](https://img.shields.io/badge/python-3.13-blue) ![Django](https://img.shields.io/badge/django-5.0-green) ![Next.js](https://img.shields.io/badge/next.js-14.0-blueviolet) ![Postman](https://img.shields.io/badge/postman-tested-orange)

Cette plateforme combine un **backend Django REST** et un **frontend Next.js** pour gérer des notes et générer des quiz intelligents.


## Backend (Django)
Backend Django REST pour **Quiz AI Platform**, permettant de :

- Générer des quiz automatiquement à partir de notes uploadées
- Soumettre et corriger les réponses
- Créer et rejoindre des sessions de quiz
- Utiliser l'IA Google Gemini pour générer des questions intelligentes

---

## 🚀 Installation

```bash
git clone <url_du_repo>
cd quiz_ai_platform/backend
python -m venv venv
# Activer le venv
venv\Scripts\activate # Windows
# ou
source venv/bin/activate # Linux/macOS
pip install -r requirements.txt

## Créer un fichier .env à la racine :
SECRET_KEY=<votre_secret_key_django>
DEBUG=True
DATABASE_URL=<url_de_votre_base_de_donnees>
GOOGLE_API_KEY=<votre_cle_api_google_genai>

## Appliquer les migrations et créer un super utilisateur :
python manage.py migrate
python manage.py createsuperuser

## Lancer le serveur :
python manage.py runserver

🔗 Endpoints principaux
## Authentification
POST /api/auth/login/ → obtenir token JWT
POST /api/auth/register/ → créer un utilisateur

## Notes
GET /api/notes/list → lister toutes les notes
POST /api/notes/upload/ → uploader une note

## Quiz
POST /api/quiz/generer/ → générer un quiz
Body JSON :
{
    "note_id": 1,
    "nb_questions": 5,
    "niveau": "Facile",
    "type_quiz": "QCM"
}
POST /api/quiz/reponse/<quiz_id>/<question_id>/ → soumettre une réponse
Body JSON :
{
    "reponse": "A"
}
POST /api/quiz/session/creer/<quiz_id>/ → créer une session de quiz
GET /api/quiz/session/rejoindre/<token>/ → rejoindre une session existante

📂 Structure du projet
backend/
├─ core_ia/            # IA et moteur RAG
├─ quiz/               # Gestion des quiz
├─ notes/              # Gestion des notes
├─ quiz_ai_backend/    # Settings Django
├─ manage.py
└─ requirements.txt

---

## Frontend (Next.js)

Frontend Next.js pour **Quiz AI Platform**, permettant aux utilisateurs de :

- S’inscrire et se connecter
- Consulter les notes et les quiz disponibles
- Participer aux quiz en temps réel
- Visualiser les résultats des quiz
- Naviguer facilement grâce à une interface réactive et moderne

## Démarrage
cd frontend
npm install
npm run dev

Accéder au frontend : http://localhost:3000

## À propos du projet
Bootstrappé avec create-next-app
Les fichiers API sont dans pages/api/ et sont mappés sur /api/*
Le projet utilise next/font
pour optimiser et charger les polices

## Documentation et ressources
Next.js Documentation
Learn Next.js
Déploiement sur Vercel

## Structure du projet complet

quiz_ai_platform/
├─ backend/      # Code Django (API)
├─ frontend/     # Code Next.js (UI)
├─ README.md     # Ce fichier
