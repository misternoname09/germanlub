"""
Script de copie du cachet vers les assets du projet.
À exécuter depuis le dossier backend : python cachet_install.py
"""
import shutil
import os

BASE = os.path.dirname(os.path.abspath(__file__))

source = r"C:\Users\LENOVO\.gemini\antigravity-ide\brain\d6586641-0c67-4523-a323-c3f535cee97f\.user_uploaded\media_1793217708528.jpg"

destinations = [
    os.path.join(BASE, "media", "cachet.jpg"),
    os.path.join(BASE, "..", "frontend", "src", "assets", "cachet.jpg"),
]

if not os.path.exists(source):
    print(f"ERREUR: fichier source introuvable:\n  {source}")
    exit(1)

for dest in destinations:
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    shutil.copy2(source, dest)
    size = os.path.getsize(dest)
    print(f"OK: {dest} ({size} octets)")

print("\nCachet installé avec succès ! Redémarrez le serveur Django.")
