import shutil
import os

source = r"C:\Users\LENOVO\.gemini\antigravity-ide\brain\d6586641-0c67-4523-a323-c3f535cee97f\.user_uploaded\media_1793217708528.jpg"
dest_assets = r"c:\germanlub_shop\frontend\src\assets\cachet.jpg"
dest_media = r"c:\germanlub_shop\backend\media\cachet.jpg"

if os.path.exists(source):
    shutil.copy(source, dest_assets)
    shutil.copy(source, dest_media)
    print("✅ Cachet copié avec succès !")
else:
    print("❌ Image source introuvable.")
