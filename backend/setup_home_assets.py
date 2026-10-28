import shutil
import os

def run():
    source = r"C:\Users\LENOVO\.gemini\antigravity-ide\brain\82c8ed27-ec74-40e1-a87e-59a3e35c0f9b\home_hero_bg_1787147855382.jpg"
    dest = r"C:\germanlub_shop\frontend\src\assets\home_hero_bg.jpg"
    
    print("Copie de l'image Hero vers le dossier assets du frontend...")
    try:
        shutil.copy(source, dest)
        print("Succès ! L'image a été copiée.")
    except Exception as e:
        print(f"Erreur : {e}")

if __name__ == "__main__":
    run()
