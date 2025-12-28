import os
import json
import re
import time
from google import genai
from dotenv import load_dotenv

class GenerateurQuiz:
    def __init__(self):
        """Initialisation de l'IA avec stratégie de secours (Failover)."""
        load_dotenv()
        self.api_key = os.getenv("GOOGLE_API_KEY")
        self.client = genai.Client(api_key=self.api_key)
        
        # --- STRATÉGIE DE SECOURS VISIBLE ---
        # Le code essaiera ces modèles dans l'ordre en cas d'erreur ou de quota atteint.
        self.modeles_prioritaires = [
            "models/gemma-3-12b-it",   # Premier choix (Ton modèle préféré)
            "models/gemma-3-4b-it",    # Secours 1 (Plus léger/rapide)
            "models/gemini-1.5-flash"  # Secours 2 (Le plus robuste au monde)
        ]
        
        # Mémoire pour éviter que l'IA ne pose deux fois la même question
        self.questions_posees = []

    def generer_question_unique(self, contexte, niveau="Facile"):
        """Génère une question unique en testant les modèles de la liste un par un."""
        
        # On prépare l'historique pour l'envoyer à l'IA
        historique = "\n".join([f"- {q}" for q in self.questions_posees[-5:]])
        
        # Boucle de sécurité sur les modèles
        for model_id in self.modeles_prioritaires:
            prompt = f"""
            CONSIGNE STRICTE : Tu es un examinateur. Utilise UNIQUEMENT le contexte fourni.
            
            CONTEXTE : 
            {contexte}

            NIVEAU DE DIFFICULTÉ : {niveau}
            
            HISTORIQUE (NE PAS RÉPÉTER CES QUESTIONS) :
            {historique}

            FORMAT DE RÉPONSE ATTENDU (JSON STRICT) :
            {{
                "question": "...",
                "options": {{"A": "...", "B": "...", "C": "...", "D": "..."}},
                "reponse": "Lettre (A, B, C ou D)",
                "explication": "Courte explication basée sur le texte"
            }}
            """

            try:
                # Appel à l'API avec une température basse pour la fidélité au texte
                response = self.client.models.generate_content(
                    model=model_id,
                    contents=prompt,
                    config={"temperature": 0.3}
                )

                if response.text:
                    donnees = self._nettoyer_et_parser_json(response.text)
                    if donnees:
                        # On mémorise la question pour la suite du quiz
                        self.questions_posees.append(donnees['question'])
                        return donnees # Succès : on renvoie la question
            
            except Exception as e:
                # Si le modèle actuel échoue (Quota, Erreur serveur...), on passe au suivant
                print(f"⚠️ Modèle {model_id} indisponible, passage au suivant...")
                continue 

        # Si tous les modèles ont échoué (très rare)
        return None

    def _nettoyer_et_parser_json(self, texte_brut):
        """Extrait le bloc JSON de la réponse brute de l'IA."""
        try:
            # On cherche les accolades pour isoler le JSON du texte superflu
            match = re.search(r'\{.*\}', texte_brut, re.DOTALL)
            if match:
                json_str = match.group(0).replace('\n', ' ')
                return json.loads(json_str)
            return None
        except:
            return None