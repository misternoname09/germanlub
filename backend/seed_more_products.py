import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from shop.models import Category, Product

# Création des catégories si manquantes
cat_moteur, _ = Category.objects.get_or_create(name='Huiles Moteur', description='Huiles haute performance')
cat_boite, _ = Category.objects.get_or_create(name='Huiles de Boite', description='Transmissions et engrenages')

products_data = [
    {'name': 'GL-PRO 5W30 - 5L (Auto)', 'visc': '5W30', 'veh': 'Auto', 'eng': 'Essence', 'price': 25000},
    {'name': 'GL-MAX 5W40 - 5L (Auto Diesel)', 'visc': '5W40', 'veh': 'Auto', 'eng': 'Diesel', 'price': 27000},
    {'name': 'GL-ECO 0W20 - 5L (Auto Hybride)', 'visc': '0W20', 'veh': 'Auto', 'eng': 'Hybride', 'price': 32000},
    {'name': 'GL-RACING 10W40 - 1L (Moto)', 'visc': '10W40', 'veh': 'Moto', 'eng': 'Essence', 'price': 18000},
    {'name': 'GL-CITY 5W30 - 1L (Scooter)', 'visc': '5W30', 'veh': 'Moto', 'eng': 'Essence', 'price': 15000},
    {'name': 'GL-SPORT 10W60 - 1L (Moto)', 'visc': '10W60', 'veh': 'Moto', 'eng': 'Essence', 'price': 22000},
    {'name': 'GL-TRUCK 15W40 - 20L (Camion)', 'visc': '15W40', 'veh': 'Camion', 'eng': 'Diesel', 'price': 45000},
    {'name': 'GL-HEAVY 20W50 - 20L (Camion)', 'visc': '20W50', 'veh': 'Camion', 'eng': 'Diesel', 'price': 42000},
    {'name': 'GL-TRANS 75W90 - 1L (Boite Auto)', 'visc': '75W90', 'veh': 'Auto', 'eng': 'Tous', 'price': 19000},
    {'name': 'GL-TRANS 80W90 - 5L (Boite Camion)', 'visc': '80W90', 'veh': 'Camion', 'eng': 'Tous', 'price': 38000},
]

print('Creation des 10 nouveaux produits de test...')
for p in products_data:
    cat = cat_boite if 'TRANS' in p['name'] else cat_moteur
    desc = 'Excellente huile ' + p['name'] + ' pour garantir la longevite de votre moteur.'
    Product.objects.create(
        category=cat,
        name=p['name'],
        description=desc,
        price=p['price'],
        stock=random.randint(20, 150),
        viscosity=p['visc'],
        vehicle_type=p['veh'],
        engine_type=p['eng'],
    )
    print('  + ' + p['name'])

print('Termine ! Allez voir votre catalogue !')
