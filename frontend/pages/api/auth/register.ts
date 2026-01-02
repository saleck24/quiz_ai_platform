// pages/api/auth/register.ts

import type { NextApiRequest, NextApiResponse } from 'next';

type RegisterRequest = {
  name: string;          // Le frontend envoie "name"
  email: string;
  password: string;
  confirmPassword: string;
};

type RegisterResponse = {
  message: string;
  user: {
    username: string;
    email: string;
  };
};

type ErrorResponse = {
  error: string;
  details?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterResponse | ErrorResponse>
) {
  // 1. Vérifier la méthode HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Méthode non autorisée. Utilisez POST.' 
    });
  }

  try {
    // 2. Extraire les données du body
    const { name, email, password, confirmPassword }: RegisterRequest = req.body;

    // 3. Validations côté serveur Next.js
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ 
        error: 'Tous les champs sont requis' 
      });
    }

    // Valider le format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Format d\'email invalide' 
      });
    }

    // Vérifier que les mots de passe correspondent
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        error: 'Les mots de passe ne correspondent pas' 
      });
    }

    // Vérifier la longueur minimale (selon vos règles frontend)
    if (password.length < 10) {
      return res.status(400).json({ 
        error: 'Le mot de passe doit contenir au moins 10 caractères' 
      });
    }

    // 4. Récupérer l'URL du backend
    const BACKEND_URL = process.env.BACKEND_URL;
    if (!BACKEND_URL) {
      console.error('BACKEND_URL non définie dans .env.local');
      return res.status(500).json({ 
        error: 'Erreur de configuration serveur' 
      });
    }

    // 5. Générer un username à partir du name
    // "John Doe" → "johndoe"
    // On enlève les espaces, on met en minuscules
    const username = name.trim().toLowerCase().replace(/\s+/g, '');
    
    // Alternative : générer un username unique avec un timestamp
    // const username = name.trim().toLowerCase().replace(/\s+/g, '') + Date.now();

    // 6. Préparer les données pour Django (exactement ce qu'il attend)
    const djangoPayload = {
      username: username,
      email: email.toLowerCase().trim(),
      password: password,
    };

    console.log(`[REGISTER] Tentative d'inscription pour ${email} (username: ${username})`);

    // 7. Envoyer la requête à Django
    const backendResponse = await fetch(`${BACKEND_URL}/api/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(djangoPayload),
    });

    const data = await backendResponse.json();

    // 8. Gérer les erreurs Django
    if (!backendResponse.ok) {
      console.error(`[REGISTER] Échec pour ${email}:`, data);
      
      // Django retourne des erreurs spécifiques par champ
      let errorMessage = 'Échec de l\'inscription';
      
      // Gérer les erreurs courantes
      if (data.username) {
        errorMessage = Array.isArray(data.username) 
          ? data.username[0] 
          : 'Ce nom d\'utilisateur est déjà pris';
      } else if (data.email) {
        errorMessage = Array.isArray(data.email)
          ? data.email[0]
          : 'Cet email est déjà utilisé';
      } else if (data.password) {
        errorMessage = Array.isArray(data.password) 
          ? data.password[0] 
          : 'Mot de passe invalide';
      } else if (data.detail) {
        errorMessage = data.detail;
      } else if (data.non_field_errors) {
        errorMessage = Array.isArray(data.non_field_errors)
          ? data.non_field_errors[0]
          : 'Erreur de validation';
      }

      return res.status(backendResponse.status).json({
        error: errorMessage,
        details: data,
      });
    }

    // 9. Succès - Django a retourné { username, email }
    console.log(`[REGISTER] Succès pour ${email}`);

    return res.status(201).json({
      message: 'Compte créé avec succès',
      user: {
        username: data.username,
        email: data.email,
      },
    });

  } catch (error) {
    console.error('[REGISTER] Erreur serveur:', error);
    
    return res.status(500).json({
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
    });
  }
}