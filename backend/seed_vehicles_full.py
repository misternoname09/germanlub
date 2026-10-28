"""
Script de remplissage COMPLET de la base de données Véhicules GermanLub.
Couvre ~90 marques réelles du marché sénégalais (neuf + occasion + import).
Japonaises, Coréennes, Européennes, Américaines, Chinoises, Indiennes,
Motos/2-roues, Bus/Camions.

Usage: python seed_vehicles_full.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from shop.models import Product, Vehicle

def run():
    products = {p.name: p for p in Product.objects.all()}
    
    print("=" * 60)
    print("Produits trouvés dans la base :")
    for name, p in products.items():
        print(f"  - ID {p.id}: {name}")
    print("=" * 60)

    if not products:
        print("ERREUR : Aucun produit trouvé !")
        return

    # Trouver les produits par format
    p_5l = p_carton = p_20l = p_200l = None
    for name, product in products.items():
        nl = name.lower()
        if '200l' in nl or 'fût' in nl or 'fut' in nl:
            p_200l = product
        elif '20l' in nl:
            p_20l = product
        elif 'carton' in nl or '4 x 5l' in nl or '4x5l' in nl:
            p_carton = product
        elif '5l' in nl:
            p_5l = product

    # Raccourcis pour les combinaisons de produits
    PART = [p_5l]                    # Particulier (voiture/moto)
    GARAGE = [p_5l, p_carton]        # Garagiste / Flotte légère
    FLOTTE = [p_20l, p_carton]       # Flotte moyenne (utilitaires)
    LOURD = [p_20l, p_200l]          # Transport lourd
    INDUS = [p_200l]                 # Industriel (BTP, gros camions)

    vehicles_data = [
        # ================================================================
        # JAPONAISES
        # ================================================================
        # --- TOYOTA (déjà ~18, on complète) ---
        ("Toyota", "4Runner", "4.0 V6 Essence", GARAGE),
        ("Toyota", "Rush", "1.5 Essence", PART),
        ("Toyota", "Vitz", "1.0 Essence", PART),
        ("Toyota", "Proace", "2.0 D-4D Diesel", GARAGE),

        # --- SUZUKI ---
        ("Suzuki", "Alto", "0.8 Essence", PART),
        ("Suzuki", "Celerio", "1.0 Essence", PART),
        ("Suzuki", "S-Presso", "1.0 Essence", PART),
        ("Suzuki", "Ignis", "1.2 Essence", PART),
        ("Suzuki", "Baleno", "1.4 Essence", PART),
        ("Suzuki", "SX4 S-Cross", "1.6 Diesel", PART),
        ("Suzuki", "Grand Vitara", "2.4 Essence", GARAGE),
        ("Suzuki", "Carry", "1.5 Essence", GARAGE),
        ("Suzuki", "Every", "0.66 Essence", PART),

        # --- NISSAN (déjà ~6, on complète) ---
        ("Nissan", "Micra", "1.0 Essence", PART),
        ("Nissan", "Note", "1.2 Essence", PART),
        ("Nissan", "Qashqai", "1.5 dCi Diesel", PART),
        ("Nissan", "Pathfinder", "2.5 Diesel", GARAGE),
        ("Nissan", "Urvan", "2.5 Diesel", GARAGE),
        ("Nissan", "Tiida", "1.6 Essence", PART),
        ("Nissan", "Sentra", "1.8 Essence", PART),

        # --- HONDA (déjà motos, on ajoute voitures) ---
        ("Honda", "Civic", "1.8 Essence", PART),
        ("Honda", "Accord", "2.4 Essence", PART),
        ("Honda", "CR-V", "2.0 Essence", PART),
        ("Honda", "HR-V", "1.5 Essence", PART),
        ("Honda", "Fit/Jazz", "1.3 Essence", PART),
        ("Honda", "City", "1.5 Essence", PART),

        # --- MAZDA ---
        ("Mazda", "3", "1.5 SkyActiv Essence", PART),
        ("Mazda", "6", "2.5 SkyActiv Essence", PART),
        ("Mazda", "CX-5", "2.2 SkyActiv-D Diesel", PART),
        ("Mazda", "CX-3", "2.0 SkyActiv Essence", PART),
        ("Mazda", "BT-50", "3.2 Diesel", GARAGE),
        ("Mazda", "2 Demio", "1.5 Essence", PART),
        ("Mazda", "323", "1.6 Essence", PART),

        # --- SUBARU ---
        ("Subaru", "Forester", "2.0 Boxer Essence", PART),
        ("Subaru", "Outback", "2.5 Boxer Essence", PART),
        ("Subaru", "Impreza", "2.0 Boxer Essence", PART),
        ("Subaru", "XV/Crosstrek", "2.0 Boxer Essence", PART),
        ("Subaru", "Legacy", "2.5 Boxer Essence", PART),

        # --- DAIHATSU ---
        ("Daihatsu", "Terios", "1.5 Essence", PART),
        ("Daihatsu", "Sirion", "1.0 Essence", PART),
        ("Daihatsu", "Rocky", "1.0 Turbo Essence", PART),
        ("Daihatsu", "Gran Max", "1.5 Essence", GARAGE),
        ("Daihatsu", "Hijet", "0.66 Essence", PART),

        # --- LEXUS ---
        ("Lexus", "LX 570", "5.7 V8 Essence", GARAGE),
        ("Lexus", "GX 460", "4.6 V8 Essence", GARAGE),
        ("Lexus", "RX 350", "3.5 V6 Essence", PART),
        ("Lexus", "NX 300", "2.0 Turbo Essence", PART),
        ("Lexus", "IS 300", "2.0 Turbo Essence", PART),

        # --- MITSUBISHI FUSO ---
        ("Mitsubishi Fuso", "Canter FE", "3.0 Diesel", FLOTTE),
        ("Mitsubishi Fuso", "Fighter FK", "6.4 Diesel", LOURD),
        ("Mitsubishi Fuso", "Super Great", "12.8 Diesel", INDUS),
        ("Mitsubishi Fuso", "Rosa Bus", "4.9 Diesel", LOURD),

        # --- HINO (déjà 2, on complète) ---
        ("Hino", "Dutro", "4.0 Diesel", FLOTTE),
        ("Hino", "Ranger", "7.7 Diesel", LOURD),

        # --- ISUZU (déjà ~5, on complète) ---
        ("Isuzu", "MU-X", "3.0 Ddi Diesel", GARAGE),
        ("Isuzu", "NPR", "5.2 Diesel", LOURD),
        ("Isuzu", "Elf", "4.8 Diesel", FLOTTE),

        # ================================================================
        # CORÉENNES
        # ================================================================
        # --- HYUNDAI (déjà ~9, on complète) ---
        ("Hyundai", "Santa Fe", "2.2 CRDi Diesel", PART),
        ("Hyundai", "Elantra", "1.6 Essence", PART),
        ("Hyundai", "Kona", "1.6 Essence", PART),
        ("Hyundai", "Venue", "1.0 Turbo Essence", PART),
        ("Hyundai", "Starex/H-1", "2.5 CRDi Diesel", GARAGE),
        ("Hyundai", "County Bus", "3.9 Diesel", LOURD),
        ("Hyundai", "Mighty", "3.9 Diesel", LOURD),

        # --- KIA (déjà ~5, on complète) ---
        ("Kia", "Cerato/Forte", "1.6 Essence", PART),
        ("Kia", "Seltos", "1.6 Essence", PART),
        ("Kia", "Carnival", "2.2 CRDi Diesel", GARAGE),
        ("Kia", "Stonic", "1.0 Turbo Essence", PART),
        ("Kia", "Soul", "1.6 Essence", PART),
        ("Kia", "Bongo III", "2.5 Diesel", GARAGE),

        # --- SSANGYONG ---
        ("SsangYong", "Rexton", "2.2 Diesel", GARAGE),
        ("SsangYong", "Tivoli", "1.6 Essence", PART),
        ("SsangYong", "Korando", "1.5 Turbo Essence", PART),
        ("SsangYong", "Musso", "2.2 Diesel", GARAGE),
        ("SsangYong", "Rodius/Turismo", "2.2 Diesel", GARAGE),

        # --- GENESIS ---
        ("Genesis", "G80", "2.5 Turbo Essence", PART),
        ("Genesis", "GV70", "2.5 Turbo Essence", PART),
        ("Genesis", "GV80", "3.5 Turbo Essence", PART),

        # ================================================================
        # EUROPÉENNES
        # ================================================================
        # --- CITROËN ---
        ("Citroën", "C3", "1.2 PureTech Essence", PART),
        ("Citroën", "C4", "1.5 BlueHDi Diesel", PART),
        ("Citroën", "C5 Aircross", "1.5 BlueHDi Diesel", PART),
        ("Citroën", "Berlingo", "1.5 BlueHDi Diesel", GARAGE),
        ("Citroën", "Jumper", "2.2 BlueHDi Diesel", FLOTTE),
        ("Citroën", "Jumpy", "2.0 BlueHDi Diesel", GARAGE),
        ("Citroën", "C-Elysée", "1.6 HDi Diesel", PART),

        # --- OPEL ---
        ("Opel", "Corsa", "1.2 Essence", PART),
        ("Opel", "Astra", "1.6 Diesel", PART),
        ("Opel", "Mokka", "1.2 Turbo Essence", PART),
        ("Opel", "Grandland", "1.5 Diesel", PART),
        ("Opel", "Combo", "1.5 Diesel", GARAGE),
        ("Opel", "Vivaro", "2.0 Diesel", GARAGE),
        ("Opel", "Movano", "2.3 Diesel", FLOTTE),

        # --- FIAT ---
        ("Fiat", "500", "1.2 Essence", PART),
        ("Fiat", "Tipo", "1.6 Diesel", PART),
        ("Fiat", "Panda", "1.0 Essence", PART),
        ("Fiat", "Doblo", "1.6 Multijet Diesel", GARAGE),
        ("Fiat", "Ducato", "2.3 Multijet Diesel", FLOTTE),
        ("Fiat", "Fiorino", "1.3 Multijet Diesel", GARAGE),
        ("Fiat", "Fullback", "2.4 Diesel", GARAGE),

        # --- ALFA ROMEO ---
        ("Alfa Romeo", "Giulietta", "1.6 JTDM Diesel", PART),
        ("Alfa Romeo", "Stelvio", "2.2 Diesel", PART),
        ("Alfa Romeo", "Giulia", "2.0 Turbo Essence", PART),
        ("Alfa Romeo", "MiTo", "1.4 Turbo Essence", PART),

        # --- BMW ---
        ("BMW", "Série 3 (F30)", "2.0 Diesel", PART),
        ("BMW", "Série 3 (G20)", "2.0 Diesel", PART),
        ("BMW", "Série 5 (G30)", "2.0 Diesel", PART),
        ("BMW", "X1", "2.0 sDrive Diesel", PART),
        ("BMW", "X3", "2.0 xDrive Diesel", PART),
        ("BMW", "X5", "3.0 xDrive Diesel", GARAGE),
        ("BMW", "Série 1", "1.5 Essence", PART),

        # --- MINI ---
        ("Mini", "Cooper", "1.5 Turbo Essence", PART),
        ("Mini", "Countryman", "2.0 Diesel", PART),
        ("Mini", "Clubman", "2.0 Diesel", PART),

        # --- AUDI ---
        ("Audi", "A3", "1.6 TDI Diesel", PART),
        ("Audi", "A4", "2.0 TDI Diesel", PART),
        ("Audi", "A6", "2.0 TDI Diesel", PART),
        ("Audi", "Q3", "2.0 TDI Diesel", PART),
        ("Audi", "Q5", "2.0 TDI Diesel", PART),
        ("Audi", "Q7", "3.0 TDI Diesel", GARAGE),

        # --- ŠKODA ---
        ("Škoda", "Octavia", "1.6 TDI Diesel", PART),
        ("Škoda", "Fabia", "1.0 TSI Essence", PART),
        ("Škoda", "Karoq", "1.5 TSI Essence", PART),
        ("Škoda", "Kodiaq", "2.0 TDI Diesel", PART),
        ("Škoda", "Rapid", "1.0 TSI Essence", PART),

        # --- SEAT ---
        ("Seat", "Ibiza", "1.0 TSI Essence", PART),
        ("Seat", "Leon", "1.6 TDI Diesel", PART),
        ("Seat", "Arona", "1.0 TSI Essence", PART),
        ("Seat", "Ateca", "2.0 TDI Diesel", PART),

        # --- VOLVO (déjà camions, on ajoute voitures) ---
        ("Volvo", "XC60", "2.0 D4 Diesel", PART),
        ("Volvo", "XC90", "2.0 D5 Diesel", GARAGE),
        ("Volvo", "S60", "2.0 T5 Essence", PART),
        ("Volvo", "V40", "2.0 D3 Diesel", PART),

        # --- LAND ROVER ---
        ("Land Rover", "Defender", "2.0 Diesel", GARAGE),
        ("Land Rover", "Discovery", "3.0 TDV6 Diesel", GARAGE),
        ("Land Rover", "Range Rover Sport", "3.0 TDV6 Diesel", GARAGE),
        ("Land Rover", "Range Rover Evoque", "2.0 Diesel", PART),
        ("Land Rover", "Freelander 2", "2.2 TD4 Diesel", PART),

        # --- JAGUAR ---
        ("Jaguar", "XE", "2.0 Diesel", PART),
        ("Jaguar", "XF", "2.0 Diesel", PART),
        ("Jaguar", "F-Pace", "2.0 Diesel", PART),
        ("Jaguar", "E-Pace", "2.0 Diesel", PART),

        # --- PORSCHE ---
        ("Porsche", "Cayenne", "3.0 V6 Diesel", GARAGE),
        ("Porsche", "Macan", "2.0 Turbo Essence", PART),
        ("Porsche", "Panamera", "3.0 V6 Essence", PART),

        # --- IVECO ---
        ("Iveco", "Daily", "3.0 Diesel", FLOTTE),
        ("Iveco", "Eurocargo", "6.7 Diesel", LOURD),
        ("Iveco", "Stralis", "12.9 Diesel", INDUS),
        ("Iveco", "Trakker", "12.9 Diesel", INDUS),

        # --- DACIA (déjà 3, on complète) ---
        ("Dacia", "Spring", "Électrique", PART),
        ("Dacia", "Jogger", "1.0 TCe Essence", PART),
        ("Dacia", "Dokker", "1.5 dCi Diesel", GARAGE),

        # ================================================================
        # AMÉRICAINES
        # ================================================================
        # --- FORD (déjà ~5, on complète) ---
        ("Ford", "Fiesta", "1.0 EcoBoost Essence", PART),
        ("Ford", "Focus", "1.5 TDCi Diesel", PART),
        ("Ford", "EcoSport", "1.5 Diesel", PART),
        ("Ford", "Explorer", "3.5 V6 Essence", GARAGE),
        ("Ford", "Bronco", "2.7 EcoBoost Essence", GARAGE),

        # --- CHEVROLET ---
        ("Chevrolet", "Spark", "1.0 Essence", PART),
        ("Chevrolet", "Aveo", "1.4 Essence", PART),
        ("Chevrolet", "Cruze", "1.8 Essence", PART),
        ("Chevrolet", "Captiva", "2.0 VCDi Diesel", PART),
        ("Chevrolet", "Trailblazer", "2.8 Duramax Diesel", GARAGE),
        ("Chevrolet", "Silverado", "5.3 V8 Essence", GARAGE),
        ("Chevrolet", "Colorado", "2.8 Duramax Diesel", GARAGE),
        ("Chevrolet", "Suburban", "5.3 V8 Essence", GARAGE),

        # --- JEEP ---
        ("Jeep", "Wrangler", "3.6 V6 Essence", GARAGE),
        ("Jeep", "Wrangler", "2.0 Turbo Essence", GARAGE),
        ("Jeep", "Grand Cherokee", "3.0 V6 Diesel", GARAGE),
        ("Jeep", "Cherokee", "2.0 Diesel", PART),
        ("Jeep", "Compass", "1.4 Turbo Essence", PART),
        ("Jeep", "Renegade", "1.6 Diesel", PART),

        # --- DODGE ---
        ("Dodge", "Charger", "3.6 V6 Essence", GARAGE),
        ("Dodge", "Challenger", "5.7 V8 Essence", GARAGE),
        ("Dodge", "Durango", "3.6 V6 Essence", GARAGE),
        ("Dodge", "Ram 1500", "5.7 HEMI V8 Essence", GARAGE),
        ("Dodge", "Journey", "2.4 Essence", PART),

        # --- GMC ---
        ("GMC", "Sierra", "5.3 V8 Essence", GARAGE),
        ("GMC", "Terrain", "1.5 Turbo Essence", PART),
        ("GMC", "Acadia", "3.6 V6 Essence", GARAGE),
        ("GMC", "Yukon", "5.3 V8 Essence", GARAGE),
        ("GMC", "Canyon", "2.8 Duramax Diesel", GARAGE),

        # --- CADILLAC ---
        ("Cadillac", "Escalade", "6.2 V8 Essence", GARAGE),
        ("Cadillac", "XT5", "3.6 V6 Essence", PART),
        ("Cadillac", "CT5", "2.0 Turbo Essence", PART),

        # --- CHRYSLER ---
        ("Chrysler", "300", "3.6 V6 Essence", PART),
        ("Chrysler", "Pacifica", "3.6 V6 Essence", GARAGE),
        ("Chrysler", "Voyager", "3.6 V6 Essence", GARAGE),

        # --- LINCOLN ---
        ("Lincoln", "Navigator", "3.5 V6 Biturbo Essence", GARAGE),
        ("Lincoln", "Aviator", "3.0 V6 Biturbo Essence", GARAGE),
        ("Lincoln", "Corsair", "2.0 Turbo Essence", PART),

        # ================================================================
        # CHINOISES (en forte croissance)
        # ================================================================
        # --- BYD ---
        ("BYD", "Seal", "Électrique", PART),
        ("BYD", "Atto 3", "Électrique", PART),
        ("BYD", "Song Plus", "1.5 Turbo Hybride", PART),
        ("BYD", "Tang", "2.0 Turbo Hybride", PART),
        ("BYD", "Han", "Électrique", PART),

        # --- CHERY ---
        ("Chery", "Tiggo 4", "1.5 Turbo Essence", PART),
        ("Chery", "Tiggo 7 Pro", "1.5 Turbo Essence", PART),
        ("Chery", "Tiggo 8 Pro", "1.6 Turbo Essence", GARAGE),
        ("Chery", "Arrizo 5", "1.5 Essence", PART),
        ("Chery", "QQ", "1.0 Essence", PART),

        # --- GREAT WALL MOTORS / HAVAL ---
        ("Great Wall", "Wingle 7", "2.0 Diesel", GARAGE),
        ("Great Wall", "Poer", "2.0 Turbo Diesel", GARAGE),
        ("Haval", "H6", "1.5 Turbo Essence", PART),
        ("Haval", "Jolion", "1.5 Turbo Essence", PART),
        ("Haval", "H2", "1.5 Turbo Essence", PART),
        ("Haval", "Dargo", "2.0 Turbo Essence", GARAGE),

        # --- JAC ---
        ("JAC", "S2", "1.5 Essence", PART),
        ("JAC", "S3", "1.6 Essence", PART),
        ("JAC", "S4", "1.5 Turbo Essence", PART),
        ("JAC", "T6", "2.0 Diesel", GARAGE),
        ("JAC", "T8", "2.0 Turbo Diesel", GARAGE),
        ("JAC", "Sunray", "2.8 Diesel", FLOTTE),
        ("JAC", "N56", "3.8 Diesel", LOURD),

        # --- JETOUR ---
        ("Jetour", "X70", "1.5 Turbo Essence", PART),
        ("Jetour", "X90", "1.6 Turbo Essence", GARAGE),
        ("Jetour", "Dashing", "1.5 Turbo Essence", PART),

        # --- KAIYI ---
        ("KAIYI", "X3 Pro", "1.5 Essence", PART),
        ("KAIYI", "X7", "1.5 Turbo Essence", PART),

        # --- ZNA ---
        ("ZNA", "Rich 6", "2.4 Diesel", GARAGE),
        ("ZNA", "Succe", "1.6 Essence", PART),

        # --- DFAC ---
        ("DFAC", "Captain E", "2.8 Diesel", FLOTTE),
        ("DFAC", "K01", "1.3 Essence", GARAGE),

        # --- SOUEAST ---
        ("SOUEAST", "DX3", "1.5 Turbo Essence", PART),
        ("SOUEAST", "DX7", "1.5 Turbo Essence", PART),

        # --- FOTON ---
        ("Foton", "Tunland", "2.8 Diesel", GARAGE),
        ("Foton", "Aumark", "3.8 Diesel", LOURD),
        ("Foton", "Auman", "6.7 Diesel", INDUS),
        ("Foton", "View", "2.8 Diesel", GARAGE),

        # --- SINOTRUK ---
        ("Sinotruk", "Howo A7", "12.0 Diesel", INDUS),
        ("Sinotruk", "Howo 371", "9.7 Diesel", INDUS),
        ("Sinotruk", "Hohan N7", "10.0 Diesel", INDUS),
        ("Sinotruk", "Steyr", "6.9 Diesel", LOURD),

        # --- DONGFENG ---
        ("Dongfeng", "Rich", "2.4 Diesel", GARAGE),
        ("Dongfeng", "AX7", "1.6 Turbo Essence", PART),
        ("Dongfeng", "KR", "6.7 Diesel", LOURD),
        ("Dongfeng", "KX", "8.9 Diesel", INDUS),
        ("Dongfeng", "Duolika", "3.8 Diesel", FLOTTE),

        # --- CHANGAN ---
        ("Changan", "CS35 Plus", "1.4 Turbo Essence", PART),
        ("Changan", "CS55 Plus", "1.5 Turbo Essence", PART),
        ("Changan", "CS75 Plus", "1.5 Turbo Essence", PART),
        ("Changan", "Alsvin", "1.5 Essence", PART),
        ("Changan", "Star Truck", "1.5 Essence", GARAGE),

        # --- MG ---
        ("MG", "ZS", "1.5 Essence", PART),
        ("MG", "HS", "1.5 Turbo Essence", PART),
        ("MG", "5", "1.5 Essence", PART),
        ("MG", "RX5", "1.5 Turbo Essence", PART),
        ("MG", "Extender", "2.0 Diesel", GARAGE),

        # --- GEELY ---
        ("Geely", "Coolray", "1.5 Turbo Essence", PART),
        ("Geely", "Azkarra", "1.5 Turbo Essence", PART),
        ("Geely", "Emgrand", "1.5 Essence", PART),
        ("Geely", "Okavango", "1.5 Turbo Essence", GARAGE),

        # --- WULING ---
        ("Wuling", "Almaz", "1.5 Turbo Essence", PART),
        ("Wuling", "Formo", "1.2 Essence", GARAGE),
        ("Wuling", "Air EV", "Électrique", PART),

        # --- GAC ---
        ("GAC", "GS3", "1.5 Turbo Essence", PART),
        ("GAC", "GS4", "1.5 Turbo Essence", PART),
        ("GAC", "GS8", "2.0 Turbo Essence", GARAGE),
        ("GAC", "GN6", "1.5 Turbo Essence", GARAGE),

        # --- FAW ---
        ("FAW", "Bestune T77", "1.5 Turbo Essence", PART),
        ("FAW", "Bestune B70", "1.5 Turbo Essence", PART),
        ("FAW", "Tiger V", "4.8 Diesel", LOURD),
        ("FAW", "J6P", "11.0 Diesel", INDUS),

        # --- BAIC ---
        ("BAIC", "X25", "1.5 Essence", PART),
        ("BAIC", "X35", "1.5 Turbo Essence", PART),
        ("BAIC", "BJ40", "2.0 Turbo Essence", GARAGE),
        ("BAIC", "D20", "1.3 Essence", PART),

        # --- LOVOL ---
        ("Lovol", "Tracteur M504", "2.5 Diesel", LOURD),
        ("Lovol", "Tracteur M804", "4.2 Diesel", LOURD),
        ("Lovol", "Chargeuse FL936", "Diesel Industriel", INDUS),

        # --- DAYANG ---
        ("Dayang", "DY150", "150cc Monocylindre", PART),
        ("Dayang", "DY200", "200cc Monocylindre", PART),
        ("Dayang", "Tricycle DY250", "250cc Monocylindre", PART),

        # --- DFSK ---
        ("DFSK", "Glory 580", "1.5 Turbo Essence", PART),
        ("DFSK", "Super Cab", "1.3 Essence", GARAGE),
        ("DFSK", "C31", "1.5 Essence", GARAGE),

        # --- LANDWIND ---
        ("Landwind", "X7", "2.0 Turbo Essence", PART),
        ("Landwind", "X2", "1.6 Essence", PART),

        # --- HAFEI ---
        ("Hafei", "Lobo", "1.0 Essence", PART),
        ("Hafei", "Minyi", "1.0 Essence", GARAGE),

        # --- BRILLIANCE ---
        ("Brilliance", "V5", "1.6 Essence", PART),
        ("Brilliance", "V3", "1.5 Essence", PART),
        ("Brilliance", "H530", "1.6 Turbo Essence", PART),

        # ================================================================
        # INDIENNES
        # ================================================================
        # --- TATA (déjà 2, on complète) ---
        ("Tata", "Nexon", "1.2 Turbo Essence", PART),
        ("Tata", "Harrier", "2.0 Diesel", PART),
        ("Tata", "Safari", "2.0 Diesel", GARAGE),
        ("Tata", "Ace", "0.7 Diesel", GARAGE),
        ("Tata", "407", "3.0 Diesel", FLOTTE),

        # --- MAHINDRA ---
        ("Mahindra", "Scorpio", "2.2 mHawk Diesel", GARAGE),
        ("Mahindra", "XUV700", "2.0 Turbo Diesel", GARAGE),
        ("Mahindra", "XUV300", "1.5 Diesel", PART),
        ("Mahindra", "Thar", "2.0 Diesel", GARAGE),
        ("Mahindra", "Bolero", "1.5 Diesel", GARAGE),
        ("Mahindra", "Pik-Up", "2.2 Diesel", GARAGE),
        ("Mahindra", "KUV100", "1.2 Essence", PART),

        # --- FORCE MOTORS ---
        ("Force Motors", "Gurkha", "2.6 Diesel", GARAGE),
        ("Force Motors", "Trax Cruiser", "2.6 Diesel", GARAGE),
        ("Force Motors", "Traveller", "2.6 Diesel", FLOTTE),

        # --- ASHOK LEYLAND (déjà 1, on complète) ---
        ("Ashok Leyland", "Dost", "2.5 Diesel", FLOTTE),
        ("Ashok Leyland", "Boss", "5.7 Diesel", LOURD),
        ("Ashok Leyland", "Captain 2523", "5.7 Diesel", INDUS),

        # ================================================================
        # MOTOS / DEUX-ROUES
        # ================================================================
        # --- PIAGGIO ---
        ("Piaggio", "Liberty 125", "125cc Monocylindre", PART),
        ("Piaggio", "Medley 150", "150cc Monocylindre", PART),
        ("Piaggio", "Beverly 300", "300cc Monocylindre", PART),
        ("Piaggio", "MP3 300", "300cc Monocylindre", PART),
        ("Piaggio", "Ape Cargo", "200cc Diesel", PART),

        # --- VESPA ---
        ("Vespa", "Primavera 125", "125cc Monocylindre", PART),
        ("Vespa", "GTS 300", "300cc Monocylindre", PART),
        ("Vespa", "Sprint 150", "150cc Monocylindre", PART),

        # --- APRILIA ---
        ("Aprilia", "SR 150", "150cc Monocylindre", PART),
        ("Aprilia", "Storm 125", "125cc Monocylindre", PART),
        ("Aprilia", "Tuono 660", "660cc Bicylindre", PART),

        # --- KTM ---
        ("KTM", "Duke 200", "200cc Monocylindre", PART),
        ("KTM", "Duke 390", "390cc Monocylindre", PART),
        ("KTM", "Adventure 390", "390cc Monocylindre", PART),
        ("KTM", "RC 200", "200cc Monocylindre", PART),

        # --- ZONGSHEN ---
        ("ZongShen", "ZS150", "150cc Monocylindre", PART),
        ("ZongShen", "ZS200", "200cc Monocylindre", PART),
        ("ZongShen", "Tricycle ZS250", "250cc Monocylindre", PART),

        # --- KEEWAY ---
        ("Keeway", "RKS 125", "125cc Monocylindre", PART),
        ("Keeway", "K-Light 250", "250cc Bicylindre", PART),
        ("Keeway", "Superlight 150", "150cc Monocylindre", PART),
        ("Keeway", "Cityblade 150", "150cc Monocylindre", PART),

        # --- SYM ---
        ("SYM", "Symphony 125", "125cc Monocylindre", PART),
        ("SYM", "Crox 125", "125cc Monocylindre", PART),
        ("SYM", "NH-X 125", "125cc Monocylindre", PART),
        ("SYM", "Maxsym 400", "400cc Monocylindre", PART),

        # --- YAMAHA (déjà 3, on complète) ---
        ("Yamaha", "NMAX 155", "155cc Monocylindre", PART),
        ("Yamaha", "MT-15", "155cc Monocylindre", PART),
        ("Yamaha", "XTZ 125", "125cc Monocylindre", PART),
        ("Yamaha", "Crypton", "110cc Monocylindre", PART),
        ("Yamaha", "FZ 250", "250cc Monocylindre", PART),

        # --- HONDA Motos (déjà 4, on complète) ---
        ("Honda", "PCX 160", "160cc Monocylindre", PART),
        ("Honda", "Wave 110", "110cc Monocylindre", PART),
        ("Honda", "CBR 250R", "250cc Monocylindre", PART),
        ("Honda", "CRF 300L", "300cc Monocylindre", PART),

        # --- SUZUKI Motos ---
        ("Suzuki", "GSX-S150", "150cc Monocylindre", PART),
        ("Suzuki", "Gixxer 155", "155cc Monocylindre", PART),
        ("Suzuki", "V-Strom 250", "250cc Bicylindre", PART),
        ("Suzuki", "Burgman 200", "200cc Monocylindre", PART),
        ("Suzuki", "Address 110", "110cc Monocylindre", PART),

        # ================================================================
        # BUS / CAMIONS (transport public)
        # ================================================================
        # --- YUTONG ---
        ("Yutong", "ZK6122H", "Diesel 8.9L", INDUS),
        ("Yutong", "ZK6116H", "Diesel 6.7L", LOURD),
        ("Yutong", "ZK6729D", "Diesel 4.5L", LOURD),
        ("Yutong", "E12 Bus Électrique", "Électrique", PART),

        # --- KING LONG ---
        ("King Long", "XMQ6127", "Diesel 8.9L", INDUS),
        ("King Long", "XMQ6900", "Diesel 6.7L", LOURD),
        ("King Long", "XMQ6106", "Diesel 6.7L", LOURD),

        # --- GOLDEN DRAGON ---
        ("Golden Dragon", "XML6127", "Diesel 8.9L", INDUS),
        ("Golden Dragon", "XML6102", "Diesel 6.7L", LOURD),
        ("Golden Dragon", "XML6700", "Diesel 3.8L", FLOTTE),

        # --- HIGER ---
        ("Higer", "KLQ6129", "Diesel 8.9L", INDUS),
        ("Higer", "KLQ6109", "Diesel 6.7L", LOURD),
        ("Higer", "KLQ6759", "Diesel 3.8L", FLOTTE),

        # --- UD TRUCKS ---
        ("UD Trucks", "Quester CDE", "5.1 Diesel", LOURD),
        ("UD Trucks", "Quester CWE", "8.0 Diesel", INDUS),
        ("UD Trucks", "Croner MKE", "5.1 Diesel", LOURD),
        ("UD Trucks", "Kuzer RKE", "3.8 Diesel", FLOTTE),

        # --- JMC ---
        ("JMC", "Vigus", "2.4 Diesel", GARAGE),
        ("JMC", "Carrying", "2.8 Diesel", FLOTTE),
        ("JMC", "Conquer", "3.2 Diesel", LOURD),
        ("JMC", "N900", "2.8 Diesel", FLOTTE),
    ]

    # ====================================================================
    # Création des véhicules
    # ====================================================================
    created_count = 0
    skipped_count = 0

    for make, model_name, engine, recommended in vehicles_data:
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

    print("\n" + "=" * 60)
    print(f"TERMINÉ ! {created_count} nouveaux véhicules créés, {skipped_count} existaient déjà.")
    print(f"Total en base : {Vehicle.objects.count()} véhicules.")
    
    # Stats par type
    makes_count = Vehicle.objects.order_by('make').values_list('make', flat=True).distinct().count()
    print(f"Nombre de marques uniques : {makes_count}")
    print("=" * 60)

if __name__ == '__main__':
    run()
