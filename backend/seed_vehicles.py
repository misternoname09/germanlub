"""
Script de remplissage de la base de données Véhicules GermanLub.
Associe les véhicules populaires au Sénégal/Afrique de l'Ouest
aux produits GL-XTREME SAE 50 correspondants.

Usage: python seed_vehicles.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from shop.models import Product, Vehicle

def run():
    # ====================================================================
    # Récupérer les produits existants par nom
    # ====================================================================
    products = {p.name: p for p in Product.objects.all()}
    
    print("=" * 60)
    print("Produits trouvés dans la base :")
    for name, p in products.items():
        print(f"  - ID {p.id}: {name}")
    print("=" * 60)

    if not products:
        print("ERREUR : Aucun produit trouvé ! Lancez d'abord seed_data.py.")
        return

    # Trouver les produits par format
    p_5l = None
    p_carton = None
    p_20l = None
    p_200l = None
    
    for name, product in products.items():
        name_lower = name.lower()
        if '200l' in name_lower or 'fût' in name_lower or 'fut' in name_lower:
            p_200l = product
        elif '20l' in name_lower:
            p_20l = product
        elif 'carton' in name_lower or '4 x 5l' in name_lower or '4x5l' in name_lower:
            p_carton = product
        elif '5l' in name_lower:
            p_5l = product

    print(f"\nProduit 5L   : {p_5l}")
    print(f"Produit Carton: {p_carton}")
    print(f"Produit 20L  : {p_20l}")
    print(f"Produit 200L : {p_200l}")

    # ====================================================================
    # Base de données véhicules
    # Format: (Marque, Modèle, Motorisation, [produits recommandés])
    #
    # L'huile SAE 50 API CF/SF est idéale pour :
    # - Moteurs essence/diesel anciens ou robustes
    # - Climats chauds (Afrique de l'Ouest)
    # - Véhicules utilitaires, pick-ups, camions
    # ====================================================================

    vehicles_data = [
        # ================================================================
        # TOYOTA - Leader du marché sénégalais (~34% parts de marché)
        # ================================================================
        ("Toyota", "Hilux", "2.4 D-4D Diesel", [p_5l, p_carton]),
        ("Toyota", "Hilux", "2.8 GD-6 Diesel", [p_5l, p_carton]),
        ("Toyota", "Hilux", "2.7 VVT-i Essence", [p_5l, p_carton]),
        ("Toyota", "Land Cruiser", "4.5 V8 Diesel", [p_5l, p_20l]),
        ("Toyota", "Land Cruiser", "4.0 V6 Essence", [p_5l, p_20l]),
        ("Toyota", "Land Cruiser 70", "4.2 Diesel", [p_5l, p_20l]),
        ("Toyota", "Corolla", "1.6 Essence", [p_5l]),
        ("Toyota", "Corolla", "1.8 Essence", [p_5l]),
        ("Toyota", "Camry", "2.5 Essence", [p_5l]),
        ("Toyota", "RAV4", "2.0 Essence", [p_5l]),
        ("Toyota", "Prado", "3.0 D-4D Diesel", [p_5l, p_carton]),
        ("Toyota", "Prado", "4.0 V6 Essence", [p_5l, p_carton]),
        ("Toyota", "Fortuner", "2.4 GD-6 Diesel", [p_5l]),
        ("Toyota", "Fortuner", "2.7 Essence", [p_5l]),
        ("Toyota", "Hiace", "2.5 D-4D Diesel", [p_5l, p_carton]),
        ("Toyota", "Hiace", "2.7 Essence", [p_5l, p_carton]),
        ("Toyota", "Avensis", "1.8 Essence", [p_5l]),
        ("Toyota", "Yaris", "1.3 Essence", [p_5l]),

        # ================================================================
        # MITSUBISHI - Pick-ups très populaires
        # ================================================================
        ("Mitsubishi", "L200", "2.4 DI-D Diesel", [p_5l, p_carton]),
        ("Mitsubishi", "L200", "2.5 DI-D Diesel", [p_5l, p_carton]),
        ("Mitsubishi", "Pajero", "3.2 DI-D Diesel", [p_5l, p_20l]),
        ("Mitsubishi", "Pajero Sport", "2.4 DI-D Diesel", [p_5l]),
        ("Mitsubishi", "Canter", "3.0 Diesel", [p_20l, p_200l]),
        ("Mitsubishi", "Outlander", "2.4 Essence", [p_5l]),

        # ================================================================
        # RENAULT - Bonne présence au Sénégal
        # ================================================================
        ("Renault", "Duster", "1.5 dCi Diesel", [p_5l]),
        ("Renault", "Duster", "1.6 Essence", [p_5l]),
        ("Renault", "Clio", "1.2 Essence", [p_5l]),
        ("Renault", "Clio", "1.5 dCi Diesel", [p_5l]),
        ("Renault", "Logan", "1.5 dCi Diesel", [p_5l]),
        ("Renault", "Logan", "1.6 Essence", [p_5l]),
        ("Renault", "Kangoo", "1.5 dCi Diesel", [p_5l, p_carton]),

        # ================================================================
        # PEUGEOT - Historiquement présent en Afrique francophone
        # ================================================================
        ("Peugeot", "208", "1.2 PureTech Essence", [p_5l]),
        ("Peugeot", "301", "1.6 HDi Diesel", [p_5l]),
        ("Peugeot", "301", "1.2 VTi Essence", [p_5l]),
        ("Peugeot", "308", "1.6 HDi Diesel", [p_5l]),
        ("Peugeot", "3008", "1.6 BlueHDi Diesel", [p_5l]),
        ("Peugeot", "Partner", "1.6 HDi Diesel", [p_5l, p_carton]),
        ("Peugeot", "Boxer", "2.2 HDi Diesel", [p_20l, p_carton]),

        # ================================================================
        # HYUNDAI - Marque en forte croissance
        # ================================================================
        ("Hyundai", "Tucson", "2.0 CRDi Diesel", [p_5l]),
        ("Hyundai", "Tucson", "2.0 Essence", [p_5l]),
        ("Hyundai", "Accent", "1.4 Essence", [p_5l]),
        ("Hyundai", "Accent", "1.6 CRDi Diesel", [p_5l]),
        ("Hyundai", "i10", "1.0 Essence", [p_5l]),
        ("Hyundai", "Creta", "1.5 Diesel", [p_5l]),
        ("Hyundai", "H100", "2.6 Diesel", [p_5l, p_carton]),
        ("Hyundai", "HD65", "3.9 Diesel", [p_20l, p_200l]),
        ("Hyundai", "HD78", "3.9 Diesel", [p_20l, p_200l]),

        # ================================================================
        # KIA - Populaire en ville
        # ================================================================
        ("Kia", "Picanto", "1.0 Essence", [p_5l]),
        ("Kia", "Rio", "1.4 Essence", [p_5l]),
        ("Kia", "Sportage", "2.0 CRDi Diesel", [p_5l]),
        ("Kia", "Sorento", "2.2 CRDi Diesel", [p_5l]),
        ("Kia", "K2700", "2.7 Diesel", [p_5l, p_carton]),

        # ================================================================
        # FORD - En progression
        # ================================================================
        ("Ford", "Ranger", "2.2 TDCi Diesel", [p_5l, p_carton]),
        ("Ford", "Ranger", "3.2 TDCi Diesel", [p_5l, p_carton]),
        ("Ford", "Escape", "2.0 EcoBoost Essence", [p_5l]),
        ("Ford", "Transit", "2.2 TDCi Diesel", [p_20l, p_carton]),
        ("Ford", "F-150", "3.5 EcoBoost Essence", [p_5l, p_20l]),

        # ================================================================
        # NISSAN - Utilitaires robustes
        # ================================================================
        ("Nissan", "Navara", "2.3 dCi Diesel", [p_5l, p_carton]),
        ("Nissan", "Patrol", "4.8 Essence", [p_5l, p_20l]),
        ("Nissan", "Patrol", "5.6 V8 Essence", [p_5l, p_20l]),
        ("Nissan", "X-Trail", "2.0 Essence", [p_5l]),
        ("Nissan", "NP300", "2.5 Diesel", [p_5l, p_carton]),
        ("Nissan", "Almera", "1.5 Essence", [p_5l]),

        # ================================================================
        # MERCEDES-BENZ - Présence dans le transport
        # ================================================================
        ("Mercedes-Benz", "Sprinter", "2.1 CDI Diesel", [p_20l, p_carton]),
        ("Mercedes-Benz", "Actros", "12.0 Diesel", [p_200l]),
        ("Mercedes-Benz", "Atego", "6.4 Diesel", [p_20l, p_200l]),
        ("Mercedes-Benz", "Classe C", "2.0 Diesel", [p_5l]),
        ("Mercedes-Benz", "Classe E", "2.0 Diesel", [p_5l]),
        ("Mercedes-Benz", "Vito", "2.1 CDI Diesel", [p_5l, p_carton]),

        # ================================================================
        # VOLKSWAGEN
        # ================================================================
        ("Volkswagen", "Polo", "1.4 Essence", [p_5l]),
        ("Volkswagen", "Golf 7", "2.0 TDI Diesel", [p_5l]),
        ("Volkswagen", "Amarok", "2.0 TDI Diesel", [p_5l, p_carton]),
        ("Volkswagen", "Transporter T6", "2.0 TDI Diesel", [p_5l, p_carton]),
        ("Volkswagen", "Crafter", "2.0 TDI Diesel", [p_20l, p_carton]),

        # ================================================================
        # ISUZU - Camions et pick-ups africains
        # ================================================================
        ("Isuzu", "D-Max", "3.0 Ddi Diesel", [p_5l, p_carton]),
        ("Isuzu", "D-Max", "1.9 Ddi Diesel", [p_5l, p_carton]),
        ("Isuzu", "NQR", "5.2 Diesel", [p_20l, p_200l]),
        ("Isuzu", "FTR", "7.8 Diesel", [p_20l, p_200l]),
        ("Isuzu", "FVZ", "9.8 Diesel", [p_200l]),

        # ================================================================
        # DACIA - Très bon rapport qualité/prix
        # ================================================================
        ("Dacia", "Duster", "1.5 dCi Diesel", [p_5l]),
        ("Dacia", "Logan", "1.5 dCi Diesel", [p_5l]),
        ("Dacia", "Sandero", "1.0 SCe Essence", [p_5l]),

        # ================================================================
        # SUZUKI
        # ================================================================
        ("Suzuki", "Jimny", "1.5 Essence", [p_5l]),
        ("Suzuki", "Swift", "1.2 Essence", [p_5l]),
        ("Suzuki", "Vitara", "1.6 Essence", [p_5l]),

        # ================================================================
        # MOTOS - Colonne vertébrale de la mobilité urbaine
        # ================================================================
        ("Bajaj", "Boxer 150", "150cc Monocylindre", [p_5l]),
        ("Bajaj", "Pulsar 200", "200cc Monocylindre", [p_5l]),
        ("Bajaj", "RE Tricycle", "200cc Diesel", [p_5l]),
        ("Honda", "CG 125", "125cc Monocylindre", [p_5l]),
        ("Honda", "CB 125F", "125cc Monocylindre", [p_5l]),
        ("Honda", "XL 125", "125cc Monocylindre", [p_5l]),
        ("Honda", "Africa Twin", "1100cc Bicylindre", [p_5l]),
        ("Yamaha", "YBR 125", "125cc Monocylindre", [p_5l]),
        ("Yamaha", "DT 125", "125cc Monocylindre", [p_5l]),
        ("Yamaha", "FZ-S 150", "150cc Monocylindre", [p_5l]),
        ("Lifan", "LF150", "150cc Monocylindre", [p_5l]),
        ("Lifan", "LF200", "200cc Monocylindre", [p_5l]),
        ("TVS", "Apache 160", "160cc Monocylindre", [p_5l]),
        ("TVS", "King Tricycle", "200cc Monocylindre", [p_5l]),
        ("Haojue", "HJ150", "150cc Monocylindre", [p_5l]),

        # ================================================================
        # MACHINES / ENGINS / GENERATEURS
        # ================================================================
        ("Caterpillar", "Chargeuse 950", "Diesel Industriel", [p_200l]),
        ("Caterpillar", "Pelle 320", "Diesel Industriel", [p_200l]),
        ("Caterpillar", "Bulldozer D6", "Diesel Industriel", [p_200l]),
        ("Komatsu", "Chargeuse WA320", "Diesel Industriel", [p_200l]),
        ("Komatsu", "Pelle PC200", "Diesel Industriel", [p_200l]),
        ("John Deere", "Tracteur 5075E", "4.5 Diesel", [p_20l, p_200l]),
        ("John Deere", "Tracteur 6120M", "4.5 Diesel", [p_20l, p_200l]),
        ("Massey Ferguson", "Tracteur MF375", "4.4 Diesel", [p_20l, p_200l]),
        ("Massey Ferguson", "Tracteur MF290", "4.4 Diesel", [p_20l, p_200l]),
        ("Kubota", "Tracteur L3800", "1.8 Diesel", [p_20l]),
        ("Honda", "Générateur EU70is", "4.0 Essence", [p_5l]),
        ("Honda", "Générateur EM5500", "4.0 Essence", [p_5l]),
        ("Perkins", "Groupe Électrogène 30kVA", "Diesel Industriel", [p_20l, p_200l]),
        ("Perkins", "Groupe Électrogène 100kVA", "Diesel Industriel", [p_20l, p_200l]),
        ("Cummins", "Groupe Électrogène 50kVA", "Diesel Industriel", [p_20l, p_200l]),
        ("Cummins", "Groupe Électrogène 200kVA", "Diesel Industriel", [p_200l]),

        # ================================================================
        # CAMIONS / BUS (Transport lourd)
        # ================================================================
        ("MAN", "TGS 33.400", "10.5 Diesel", [p_200l]),
        ("MAN", "TGA 26.360", "10.5 Diesel", [p_200l]),
        ("Volvo", "FH 440", "12.8 Diesel", [p_200l]),
        ("Volvo", "FM 380", "10.8 Diesel", [p_200l]),
        ("Scania", "R450", "13.0 Diesel", [p_200l]),
        ("DAF", "CF 85.410", "12.6 Diesel", [p_200l]),
        ("Hino", "500 Series", "7.7 Diesel", [p_20l, p_200l]),
        ("Hino", "300 Series", "4.0 Diesel", [p_20l, p_200l]),
        ("Tata", "LPT 1618", "5.9 Diesel", [p_20l, p_200l]),
        ("Tata", "Ultra 1014", "3.0 Diesel", [p_20l]),
        ("Ashok Leyland", "Ecomet 1214", "3.8 Diesel", [p_20l, p_200l]),
    ]

    # ====================================================================
    # Création des véhicules
    # ====================================================================
    created_count = 0
    skipped_count = 0

    for make, model_name, engine, recommended in vehicles_data:
        # Filtrer les produits None (au cas où un format n'existe pas)
        valid_products = [p for p in recommended if p is not None]
        
        vehicle, created = Vehicle.objects.get_or_create(
            make=make,
            model_name=model_name,
            engine=engine
        )
        
        if created:
            vehicle.recommended_products.set(valid_products)
            vehicle.save()
            created_count += 1
            prods_str = ", ".join([p.name for p in valid_products])
            print(f"  ✅ {make} {model_name} ({engine}) -> {prods_str}")
        else:
            skipped_count += 1
            print(f"  ⏭️  {make} {model_name} ({engine}) existe déjà, ignoré.")

    print("\n" + "=" * 60)
    print(f"TERMINÉ ! {created_count} véhicules créés, {skipped_count} ignorés.")
    print(f"Total en base : {Vehicle.objects.count()} véhicules.")
    print("=" * 60)

if __name__ == '__main__':
    run()
