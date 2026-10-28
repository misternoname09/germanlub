from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Product(models.Model):
    VEHICLE_CHOICES = (
        ('Tous', 'Tous les véhicules'),
        ('Tourisme', 'Véhicules de tourisme'),
        ('Poids lourd', 'Poids lourds'),
        ('Moto', 'Motos'),
        ('Utilitaires', 'Véhicules utilitaires'),
    )
    ENGINE_CHOICES = (
        ('Tous', 'Toutes motorisations'),
        ('Essence', 'Essence'),
        ('Diesel', 'Diesel'),
        ('Hybride', 'Hybride'),
    )

    category = models.ForeignKey(Category, related_name='products', on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    technical_sheet = models.FileField(upload_to='technical_sheets/', blank=True, null=True, help_text="Fiche technique PDF")
    viscosity = models.CharField(max_length=20, blank=True, null=True, help_text="Ex: 5W30, 15W40")
    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_CHOICES, default='Tous')
    engine_type = models.CharField(max_length=20, choices=ENGINE_CHOICES, default='Tous')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Coupon(models.Model):
    code = models.CharField(max_length=50, unique=True)
    discount_percent = models.PositiveIntegerField(help_text="Discount in percentage (e.g., 10 for 10%)")
    active = models.BooleanField(default=True)
    valid_until = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.code} ({self.discount_percent}%)"

class Order(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('VALIDATED', 'Validated'),
        ('SHIPPING', 'Shipping'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
    )
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    customer_name = models.CharField(max_length=150)
    customer_email = models.EmailField(max_length=254, blank=True, null=True, default='')
    customer_phone = models.CharField(max_length=20)
    customer_address = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    is_quote = models.BooleanField(default=False)
    
    # Pricing fields
    coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order {self.id} - {self.customer_name}"

    @property
    def invoice_number(self):
        year = self.created_at.strftime('%y')
        return f"LES/GERM{year}-{self.id:03d}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} x {self.product.name} (Order {self.order.id})"

class Review(models.Model):
    product = models.ForeignKey(Product, related_name='reviews', on_delete=models.CASCADE)
    author_name = models.CharField(max_length=100)
    rating = models.PositiveSmallIntegerField(default=5) # 1 to 5
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.rating} stars by {self.author_name} for {self.product.name}"

class BlogPost(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    image = models.ImageField(upload_to='blog/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Vehicle(models.Model):
    make = models.CharField(max_length=100, help_text="Ex: Toyota, Volkswagen")
    model_name = models.CharField(max_length=100, help_text="Ex: Hilux, Golf 7")
    engine = models.CharField(max_length=100, help_text="Ex: 2.5 D-4D, 2.0 TDI")
    recommended_products = models.ManyToManyField(Product, related_name='vehicles', blank=True)

    class Meta:
        unique_together = ('make', 'model_name', 'engine')
        ordering = ['make', 'model_name']

    def __str__(self):
        return f"{self.make} {self.model_name} {self.engine}"
