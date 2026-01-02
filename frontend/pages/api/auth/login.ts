// pages/api/auth/login.ts

import type { NextApiRequest, NextApiResponse } from 'next';

type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    student_code: string;
    first_name: string;
    last_name: string;
  };
  tokens: {
    refresh: string;
    access: string;
  };
};

type ErrorResponse = {
  error: string;
  details?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse | ErrorResponse>
) {
  // 1. Vérifier la méthode HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Méthode non autorisée. Utilisez POST.' 
    });
  }

  try {
    // 2. Extraire les données du body
    const { email, password }: LoginRequest = req.body;

    // 3. Validations côté serveur Next.js
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email et mot de passe sont requis' 
      });
    }

    // Valider le format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Format d\'email invalide' 
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

    // 5. Préparer les données pour Django
    // Note: Django attend généralement 'email' comme identifiant
    // Si votre API Django utilise 'email' directement
    const djangoPayload = {
      email: email.toLowerCase().trim(),
      password: password,
    };

    console.log(`[LOGIN] Tentative de connexion pour ${email}`);

    // 6. Envoyer la requête à Django
    const backendResponse = await fetch(`${BACKEND_URL}/api/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(djangoPayload),
    });

    const data = await backendResponse.json();

    // 7. Gérer les erreurs Django
    if (!backendResponse.ok) {
      console.error(`[LOGIN] Échec pour ${email}:`, data);
      
      let errorMessage = 'Échec de la connexion';
      
      // Gérer les erreurs courantes
      if (data.detail) {
        errorMessage = data.detail;
      } else if (data.non_field_errors) {
        errorMessage = Array.isArray(data.non_field_errors)
          ? data.non_field_errors[0]
          : 'Identifiants invalides';
      } else if (data.email) {
        errorMessage = Array.isArray(data.email)
          ? data.email[0]
          : data.email;
      } else if (data.password) {
        errorMessage = Array.isArray(data.password)
          ? data.password[0]
          : data.password;
      } else if (data.error) {
        errorMessage = data.error;
      }

      return res.status(backendResponse.status).json({
        error: errorMessage,
        details: data,
      });
    }

    // 8. Succès - Stocker les tokens de manière sécurisée
    console.log(`[LOGIN] Succès pour ${email}, utilisateur ID: ${data.user?.id}`);

    // 9. Définir les cookies HTTP-only pour les tokens (sécurisé)
    // Note: En production, utilisez `httpOnly: true` et `secure: true`
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Token d'accès (court terme)
    res.setHeader('Set-Cookie', [
      `access_token=${data.tokens.access}; Path=/; ${isProduction ? 'Secure; ' : ''}HttpOnly; SameSite=Lax; Max-Age=${60 * 60}`, // 1 heure
      `refresh_token=${data.tokens.refresh}; Path=/; ${isProduction ? 'Secure; ' : ''}HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`, // 7 jours
    ]);

    // 10. Retourner la réponse au frontend (sans tokens dans le body pour plus de sécurité)
    return res.status(200).json({
      message: data.message || 'Connexion réussie',
      user: data.user,
      // On peut aussi retourner les tokens si nécessaire pour le frontend
      // Mais il est plus sécurisé de les garder seulement dans les cookies
      tokens: {
        access: data.tokens.access,
        refresh: data.tokens.refresh,
      },
    });

  } catch (error) {
    console.error('[LOGIN] Erreur serveur:', error);
    
    return res.status(500).json({
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
    });
  }
}