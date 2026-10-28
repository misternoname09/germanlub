import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from shop.models import BlogPost

def run():
    print("Nettoyage des anciens articles de blog (optionnel)...")
    BlogPost.objects.all().delete()

    print("Création des articles de blog...")

    blog_posts = [
        {
            "title": "Comment choisir la bonne huile moteur pour votre véhicule ?",
            "content": """Le choix de l'huile moteur est crucial pour assurer la longévité de votre véhicule. 
Une bonne huile protège contre l'usure, réduit les frottements et aide à refroidir le moteur.
Il est essentiel de vérifier la viscosité (comme SAE 50) et les normes de l'industrie (comme API CF/SF) recommandées par le constructeur de votre véhicule.
L'huile GL-XTREME de Germanlub est spécialement formulée pour offrir une protection maximale même dans les conditions les plus difficiles."""
        },
        {
            "title": "Les 5 signes qu'il est temps de faire sa vidange",
            "content": """Ne négligez pas votre vidange ! Voici 5 signes qui ne trompent pas :
1. Le voyant d'huile s'allume sur votre tableau de bord.
2. L'huile est sombre et sale (elle doit être d'une couleur ambrée et translucide).
3. Le moteur est plus bruyant que d'habitude (cliquetis).
4. De la fumée sombre sort de votre pot d'échappement.
5. Vous avez dépassé le kilométrage recommandé par votre constructeur.
Pensez à Germanlub pour votre prochaine vidange !"""
        },
        {
            "title": "Pourquoi l'huile GL-XTREME SAE 50 est idéale pour les flottes ?",
            "content": """Gérer une flotte de camions ou de véhicules utilitaires nécessite de l'efficacité et de la fiabilité.
La GL-XTREME SAE 50 a été conçue avec une technologie anti-usure avancée pour résister aux hautes températures et aux charges lourdes.
De plus, son conditionnement en fût de 200L ou en bidon de 20L permet de faire des économies d'échelle tout en garantissant des performances optimales sur le long terme.
C'est le partenaire idéal pour les professionnels du transport !"""
        }
    ]

    for b in blog_posts:
        BlogPost.objects.create(
            title=b['title'],
            content=b['content']
        )
        print(f"Article ajouté : {b['title']}")

    print("Blog rempli avec succès !")

if __name__ == '__main__':
    run()
