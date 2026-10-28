import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from shop.models import Coupon

coupon, created = Coupon.objects.get_or_create(
    code='PROMO10',
    defaults={'discount_percent': 10, 'active': True}
)

if created:
    print(f"✅ Le code promo '{coupon.code}' a été créé avec succès avec {coupon.discount_percent}% de réduction !")
else:
    print(f"ℹ️ Le code promo '{coupon.code}' existait déjà.")
