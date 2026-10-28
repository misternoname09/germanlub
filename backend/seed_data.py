import os
import django
import shutil

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from shop.models import Category, Product

def run():
    print("Nettoyage des anciens produits (optionnel)...")
    Product.objects.all().delete()
    Category.objects.all().delete()

    print("Création de la catégorie Huile Moteur...")
    cat_moteur, _ = Category.objects.get_or_create(
        name="Huiles Moteur",
        description="Huiles haute performance pour moteurs diesel et essence."
    )

    print("Création des produits...")

    products_data = [
        {
            "name": "GL-XTREME SAE 50 - 5L",
            "description": "Huile moteur haute performance GL-XTREME SAE 50 API CF/SF. Bidon de 5 Litres. Idéal pour véhicules de tourisme et utilitaires légers.",
            "price": 12500.00,
            "stock": 150,
            "image_filename": "5L.jpg",
            "source_path": r"C:\Users\LENOVO\.gemini\antigravity-ide\brain\82c8ed27-ec74-40e1-a87e-59a3e35c0f9b\.user_uploaded\media_1787146816047.jpg"
        },
        {
            "name": "GL-XTREME SAE 50 - Carton (4 x 5L)",
            "description": "Carton contenant 4 bidons de 5 Litres de GL-XTREME SAE 50 API CF/SF. Parfait pour les revendeurs et les garagistes.",
            "price": 48000.00,
            "stock": 50,
            "image_filename": "carton_4x5L.jpg",
            "source_path": r"C:\Users\LENOVO\.gemini\antigravity-ide\brain\82c8ed27-ec74-40e1-a87e-59a3e35c0f9b\.user_uploaded\media_1787146816503.jpg"
        },
        {
            "name": "GL-XTREME SAE 50 - 20L",
            "description": "Bidon grand format de 20 Litres de GL-XTREME SAE 50 API CF/SF. Adapté pour les flottes de véhicules et les camions.",
            "price": 45000.00,
            "stock": 80,
            "image_filename": "20L.jpg",
            "source_path": r"C:\Users\LENOVO\.gemini\antigravity-ide\brain\82c8ed27-ec74-40e1-a87e-59a3e35c0f9b\.user_uploaded\media_1787146816912.jpg"
        },
        {
            "name": "GL-XTREME SAE 50 - Fût 200L",
            "description": "Fût industriel de 200 Litres de GL-XTREME SAE 50. Pour un usage intensif, l'industrie et les grandes entreprises de transport.",
            "price": 420000.00,
            "stock": 20,
            "image_filename": "200L.jpg",
            "source_path": r"C:\Users\LENOVO\.gemini\antigravity-ide\brain\82c8ed27-ec74-40e1-a87e-59a3e35c0f9b\.user_uploaded\media_1787146817282.jpg"
        }
    ]

    media_products_dir = os.path.join('media', 'products')
    os.makedirs(media_products_dir, exist_ok=True)

    for p in products_data:
        # Copier l'image
        dest_image_path = os.path.join(media_products_dir, p['image_filename'])
        try:
            shutil.copy(p['source_path'], dest_image_path)
            db_image_path = f"products/{p['image_filename']}"
        except Exception as e:
            print(f"Erreur lors de la copie de l'image {p['image_filename']}: {e}")
            db_image_path = ""

        # Créer le produit
        Product.objects.create(
            category=cat_moteur,
            name=p['name'],
            description=p['description'],
            price=p['price'],
            stock=p['stock'],
            image=db_image_path
        )
        print(f"Produit ajouté : {p['name']}")

    print("Base de données mise à jour avec succès !")

if __name__ == '__main__':
    run()
