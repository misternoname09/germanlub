import os
import django
import shutil

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from shop.models import BlogPost

def run():
    print("Mise à jour des images du blog...")

    blog_data = [
        {
            "title_contains": "Comment choisir la bonne huile",
            "image_filename": "blog_engine_oil.jpg",
            "source_path": r"C:\Users\LENOVO\.gemini\antigravity-ide\brain\82c8ed27-ec74-40e1-a87e-59a3e35c0f9b\blog_engine_oil_1787147397912.jpg"
        },
        {
            "title_contains": "5 signes",
            "image_filename": "blog_oil_dipstick.jpg",
            "source_path": r"C:\Users\LENOVO\.gemini\antigravity-ide\brain\82c8ed27-ec74-40e1-a87e-59a3e35c0f9b\blog_oil_dipstick_1787147407998.jpg"
        },
        {
            "title_contains": "flottes",
            "image_filename": "blog_truck_fleet.jpg",
            "source_path": r"C:\Users\LENOVO\.gemini\antigravity-ide\brain\82c8ed27-ec74-40e1-a87e-59a3e35c0f9b\blog_truck_fleet_1787147418222.jpg"
        }
    ]

    media_blog_dir = os.path.join('media', 'blog')
    os.makedirs(media_blog_dir, exist_ok=True)

    for b in blog_data:
        try:
            post = BlogPost.objects.get(title__icontains=b['title_contains'])
            
            # Copier l'image
            dest_image_path = os.path.join(media_blog_dir, b['image_filename'])
            shutil.copy(b['source_path'], dest_image_path)
            
            # Mettre à jour l'article
            post.image = f"blog/{b['image_filename']}"
            post.save()
            print(f"Image ajoutée avec succès à : {post.title}")
            
        except BlogPost.DoesNotExist:
            print(f"Article introuvable pour : {b['title_contains']}")
        except Exception as e:
            print(f"Erreur pour {b['title_contains']}: {e}")

    print("Terminé ! Les images du blog ont été ajoutées.")

if __name__ == '__main__':
    run()
