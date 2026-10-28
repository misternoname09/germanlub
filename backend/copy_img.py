import shutil
import os

source = r"C:\Users\LENOVO\.gemini\antigravity-ide\brain\82c8ed27-ec74-40e1-a87e-59a3e35c0f9b\.user_uploaded\media_1787176432378.jpg"
dest = r"c:\germanlub_shop\frontend\src\assets\home_hero_bg.jpg"

if os.path.exists(source):
    shutil.copy(source, dest)
    print("✅ Image copiée avec succès !")
else:
    print("❌ Image source introuvable.")
