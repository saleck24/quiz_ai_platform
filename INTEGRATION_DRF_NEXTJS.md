# 📚 Plateforme de Quiz & Notes (Next.js + Django REST Framework)

Cette application permet à un utilisateur authentifié de :
- téléverser des documents (PDF, DOCX, TXT)
- consulter ses notes
- générer automatiquement des quiz à partir de ses notes
- répondre aux questions (QCM)
- recevoir un feedback immédiat (correct / incorrect)

Le projet est composé de :
- **Frontend** : Next.js (React, TypeScript)
- **Backend** : Django + Django REST Framework (DRF)
- **Auth** : JWT (access / refresh tokens via cookies HttpOnly)

---

## 🏗️ Architecture du projet

```
quiz_ai_platform/
│
├── backend/                    # API Django REST
│   ├── core_ia/               # Moteur IA et RAG
│   ├── quiz/                  # Gestion des quiz
│   ├── notes/                 # Gestion des notes
│   ├── quiz_ai_backend/       # Configuration Django
│   ├── manage.py
│   ├── requirements.txt
│   └── .env                   # Variables d'environnement
│
├── FRONTEND/
│    ├─ pages/
│    │   ├─ api/
│    │   │   ├─ auth/
│    │   │   │   ├─ login.ts
│    │   │   │   └─ logout.ts
│    │   │   ├─ notes/
│    │   │   │   ├─ list.ts
│    │   │   │   └─ upload.ts
│    │   │   └─ quiz/
│    │   │       ├─ generer.ts
│    │   │       └─ reponse/[quiz_id]/[question_id].ts
│    │   ├─ dashboard/
│    │   │   └─ index.tsx
│    │   ├─ documents/
│    │   │   └─ upload.tsx
│    │   └─ quiz/
│    │       └─ generate.tsx
│    │
│    ├─ components/
│    │   ├─ Layout.tsx
│    │   └─ ui/
│    │
│    ├─ lib/
│    │   └─ api.ts
│    │
│    └─ middleware.ts   
│        
└── INTEGRATION_DRF_NEXTJS.md   # Ce fichier
└── README.md   
             
```

---

## 🔧 Installation Backend

### Prérequis

- Python 3.13+
- pip
- Virtualenv (recommandé)

### Étapes d'installation

```bash
# 1. Cloner le projet
git clone <url_du_repo>
cd quiz_ai_platform/backend

# 2. Créer et activer l'environnement virtuel
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate

# 3. Installer les dépendances
pip install -r requirements.txt

# 4. Installer Django CORS Headers (pour la communication frontend-backend)
pip install django-cors-headers
```

### Configuration Backend

#### 1. Créer le fichier `.env` dans `backend/`

```env
SECRET_KEY=votre_secret_key_django_ultra_securisee
DEBUG=True

# Base de données MySQL
DB_NAME=quiz_ai
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306
GOOGLE_API_KEY=votre_cle_api_google_genai

# Configuration CORS
ALLOWED_HOSTS=localhost,127.0.0.1
```

#### 2. Mettre à jour `backend/quiz_ai_backend/settings.py`

Ajoutez ces configurations :

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Apps tierces
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',  # 🆕 Pour CORS
    
    # Apps du projet
    'notes',
    'quiz',
    'core_ia',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # 🆕 EN PREMIER !
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# 🆕 Configuration CORS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# 🆕 Configuration REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

# 🆕 Configuration JWT
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

#### 3. Appliquer les migrations

```bash
python manage.py migrate
python manage.py createsuperuser
```

#### 4. Lancer le serveur

```bash
python manage.py runserver
```

✅ Backend accessible sur : **http://localhost:8000**

---

## 🎨 Installation Frontend

### Prérequis

- Node.js 16+
- npm ou yarn

### Étapes d'installation

```bash
# 1. Accéder au dossier frontend
cd frontend

# 2. Installer les dépendances
npm install

# 3. Installer Axios (client HTTP)
npm install axios
```

### Configuration Frontend
---

## 🔐 Authentification

- Login via `/api/auth/login`
- Logout via `/api/auth/logout`
- Tokens stockés en cookies HttpOnly
- Middleware Next.js pour la protection des routes

---

## 📄 Gestion des Notes

- Upload : `/api/notes/upload`
- Liste : `/api/notes/list`
- Fichiers stockés dans `media/notes/` côté Django
- Affichage et ouverture depuis le dashboard

---

## 🧠 Quiz

- Génération : `/api/quiz/generer`
- Réponse : `/api/quiz/reponse/<quiz_id>/<question_id>`
- Feedback immédiat (correct / incorrect)

---

## 🔐 Endpoints API

### Authentification

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| POST | `/api/auth/login/` | Connexion utilisateur avec email | `{email, password}` |
| POST | `/api/auth/register/` | Inscription nouvel utilisateur | `{username, email, password, student_code?}` |
| POST | `/api/auth/token/refresh/` | Rafraîchir le token d'accès | `{refresh}` |
| POST | `/api/auth/token/` | Alias pour login (accepte email) | `{email, password}` |
| GET | `/api/auth/profile/` | Obtenir profil utilisateur | Aucun |
| POST | `/api/auth/password-reset/` | Demander réinitialisation mot de passe | `{email}` |
| POST | `/api/auth/password-reset-confirm/<uid>/<token>/` | Confirmer réinitialisation | `{password}` |
| GET | `/api/auth/verify-email/<uid>/<token>/` | Vérifier adresse email | Aucun |

### Notes

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/notes/list/` | Liste des notes | ✅ |
| POST | `/api/notes/upload/` | Upload une note | ✅ |

### Quiz

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| POST | `/api/quiz/generer/` | Générer un quiz | `{note_id, nb_questions, niveau, type_quiz}` |
| POST | `/api/quiz/reponse/:quiz_id/:question_id/` | Soumettre une réponse | `{reponse}` |
| POST | `/api/quiz/session/creer/:quiz_id/` | Créer une session | - |
| GET | `/api/quiz/session/rejoindre/:token/` | Rejoindre une session | - |

---