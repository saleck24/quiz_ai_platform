import numpy as np

class MoteurRecherche:
    """
    Gère la base de connaissances extraite du PDF.
    Permet de naviguer dans les thématiques du document (RF3).
    """
    def __init__(self):
        self.chunks = []
        self.thematiques = {} # Dictionnaire pour lier un titre à un chunk

    def stocker_extraits(self, liste_chunks):
        """
        Stocke les morceaux et tente d'identifier un titre pour chaque morceau.
        """
        self.chunks = liste_chunks
        self.thematiques = {}
        
        for i, chunk in enumerate(self.chunks):
            # On prend les 40 premiers caractères comme 'Titre' du morceau
            titre = chunk[:40].strip() + "..."
            self.thematiques[titre] = chunk
            
        print(f"✅ Base RAG prête avec {len(self.chunks)} thématiques.")

    def obtenir_liste_titres(self):
        """ Retourne la liste des titres pour que l'utilisateur puisse choisir. """
        return list(self.thematiques.keys())

    def chercher_contexte(self, choix_utilisateur=None):
        """
        Si l'utilisateur a choisi un titre, on renvoie le chunk correspondant.
        Sinon, on renvoie un chunk aléatoire.
        """
        if not self.chunks:
            return "Aucun contenu disponible."

        if choix_utilisateur in self.thematiques:
            return self.thematiques[choix_utilisateur]
        
        # Par défaut, sélectionne un morceau au hasard pour varier les plaisirs
        return np.random.choice(self.chunks)

# --- TEST DU MOTEUR ---
if __name__ == "__main__":
    moteur = MoteurRecherche()
    extraits = [
        "Installation de Ngrok : sudo snap install ngrok sur Ubuntu.",
        "Authentification : Configuration du token avec ngrok config add-authtoken.",
        "Déploiement Nginx : Lancement du serveur avec systemctl start nginx."
    ]
    moteur.stocker_extraits(extraits)
    
    print("\n--- Menu de révision ---")
    titres = moteur.obtenir_liste_titres()
    for idx, t in enumerate(titres):
        print(f"{idx + 1}. {t}")
        
    choix = titres[0] # Simule le choix de l'utilisateur
    print(f"\n🔍 Contenu pour réviser '{choix}' :")
    print(moteur.chercher_contexte(choix))