import logging
from rest_framework import viewsets, status, permissions, filters
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from django.core.mail import EmailMessage
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.http import FileResponse, HttpResponse
import os
import csv
import random
from datetime import timedelta
from .models import Category, Product, Order, OrderItem, Review, BlogPost, Coupon, Vehicle
from .serializers import CategorySerializer, ProductSerializer, OrderSerializer, ReviewSerializer, BlogPostSerializer, CouponSerializer, VehicleSerializer
from .utils import generate_invoice_pdf, generate_delivery_slip_pdf

class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = [permissions.IsAdminUser]

class CouponValidationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        code = request.data.get('code')
        if not code:
            return Response({'error': 'Veuillez fournir un code promo.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            coupon = Coupon.objects.get(code__iexact=code, active=True)
            if coupon.valid_until and coupon.valid_until < timezone.now():
                return Response({'error': 'Ce code promo a expiré.'}, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({
                'code': coupon.code,
                'discount_percent': coupon.discount_percent
            })
        except Coupon.DoesNotExist:
            return Response({'error': 'Code promo invalide.'}, status=status.HTTP_404_NOT_FOUND)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'create']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def create(self, request, *args, **kwargs):
        # We ensure the review is linked to a product appropriately
        return super().create(request, *args, **kwargs)

class BlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer

class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['make', 'model_name', 'engine']
    search_fields = ['make', 'model_name', 'engine']

    @action(detail=False, methods=['get'])
    def makes(self, request):
        makes = Vehicle.objects.order_by('make').values_list('make', flat=True).distinct()
        return Response(list(makes))

    @action(detail=False, methods=['get'])
    def models(self, request):
        make = request.query_params.get('make')
        if not make:
            return Response([])
        models = Vehicle.objects.filter(make=make).order_by('model_name').values_list('model_name', flat=True).distinct()
        return Response(list(models))

    @action(detail=False, methods=['get'])
    def engines(self, request):
        make = request.query_params.get('make')
        model_name = request.query_params.get('model')
        if not make or not model_name:
            return Response([])
        engines = Vehicle.objects.filter(make=make, model_name=model_name).order_by('engine').values_list('engine', flat=True).distinct()
        return Response(list(engines))

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'makes', 'models', 'engines']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'viscosity', 'vehicle_type', 'engine_type', 'vehicles']
    search_fields = ['name', 'description', 'category__name']
    ordering_fields = ['price', 'created_at']
    ordering = ['-created_at']

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def recommendations(self, request, pk=None):
        product = self.get_object()
        # Mock Scikit-Learn Content-Based Filtering: 
        # Return 3 other products from the same category or random
        similar_products = Product.objects.filter(category=product.category).exclude(id=product.id)[:3]
        if not similar_products:
            similar_products = Product.objects.exclude(id=product.id)[:3]
        serializer = self.get_serializer(similar_products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def inventory_report(self, request):
        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="inventaire_germanlub.csv"'
        
        # Add BOM for Excel UTF-8 compatibility
        response.write('\ufeff'.encode('utf8'))
        
        writer = csv.writer(response, delimiter=';')
        writer.writerow(['ID', 'Nom du Produit', 'Catégorie', 'Prix Unitaire (F CFA)', 'En Stock', 'Valeur Totale (F CFA)'])
        
        products = Product.objects.all().order_by('name')
        for product in products:
            valeur = product.price * product.stock
            writer.writerow([
                product.id,
                product.name,
                product.category.name if product.category else 'Aucune',
                product.price,
                product.stock,
                valeur
            ])
            
        return response

class ForecastView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Mock Prophet Stock Forecasting
        # Generates a 30-day forecast trend
        forecast = []
        base_value = 50
        for i in range(30):
            date = (timezone.now() + timedelta(days=i)).strftime('%Y-%m-%d')
            # Add some random noise to simulate a trend
            trend = base_value + (i * 1.5) + random.uniform(-5, 5)
            forecast.append({
                'ds': date,
                'yhat': max(0, round(trend))
            })
        return Response({'forecast': forecast})

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def pending_count(self, request):
        count = Order.objects.filter(status='PENDING').count()
        return Response({'count': count})

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        items = data.pop('items', [])
        coupon_code = data.pop('coupon_code', None)
        is_quote = data.get('is_quote', False)
        
        # 1. Verification of stock
        if not is_quote:
            for item in items:
                try:
                    product = Product.objects.get(id=item['product_id'])
                    qty = item.get('quantity', 1)
                    if product.stock < qty:
                        return Response(
                            {'error': f"Stock insuffisant pour le produit {product.name} (Stock actuel: {product.stock})."},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                except Product.DoesNotExist:
                    return Response({'error': "Produit introuvable."}, status=status.HTTP_400_BAD_REQUEST)
        
        coupon_obj = None
        if coupon_code:
            try:
                # We check active, and if valid_until is valid. Assuming valid for now if it exists
                coupon_obj = Coupon.objects.get(code__iexact=coupon_code, active=True)
            except Coupon.DoesNotExist:
                pass
        
        order = Order.objects.create(**data)
        if request.user.is_authenticated:
            order.user = request.user
            
        subtotal = 0
        product_ids = [item['product_id'] for item in items]
        products_dict = {p.id: p for p in Product.objects.filter(id__in=product_ids)}
        
        order_items_to_create = []
        products_to_update = []
        
        for item in items:
            product = products_dict.get(item['product_id'])
            if not product:
                continue
            quantity = item.get('quantity', 1)
            price = product.price
            subtotal += price * quantity
            order_items_to_create.append(
                OrderItem(
                    order=order,
                    product=product,
                    quantity=quantity,
                    price=price
                )
            )
            
            # Decrease stock
            if not is_quote:
                product.stock -= quantity
                products_to_update.append(product)
                
        OrderItem.objects.bulk_create(order_items_to_create)
        if products_to_update:
            Product.objects.bulk_update(products_to_update, ['stock'])
            
        order.subtotal = subtotal
        
        if coupon_obj:
            order.coupon = coupon_obj
            discount = (subtotal * coupon_obj.discount_percent) / 100
            order.discount_amount = discount
            order.total_amount = subtotal - discount
        else:
            order.total_amount = subtotal
            
        order.save()
        
        # --- SEND CONFIRMATION EMAILS ---
        try:
            if is_quote:
                # 1. Email to Customer (Devis)
                customer_subject = f"Demande de Devis N° {order.id} - GermanLub"
                customer_body = f"Bonjour {order.customer_name},\n\nNous avons bien reçu votre demande de devis d'un montant estimé à {order.total_amount} F CFA.\nNotre équipe va étudier votre demande et vous recontactera très prochainement.\n\nMerci de votre confiance,\nL'équipe GermanLub."
                
                # 2. Email to Manager (Devis)
                manager_subject = f"📄 Nouvelle Demande de Devis N° {order.id} !"
                manager_body = f"Bonjour Gérant,\n\nUne nouvelle demande de devis vient d'être effectuée :\n\nClient : {order.customer_name}\nTéléphone : {order.customer_phone}\nMontant : {order.total_amount} F CFA\n\nVeuillez vous connecter à l'espace Gérant pour la traiter."
            else:
                # 1. Email to Customer (Order)
                customer_subject = f"Confirmation de Commande N° {order.id} - GermanLub"
                customer_body = f"Bonjour {order.customer_name},\n\nNous avons bien reçu votre commande d'un montant de {order.total_amount} F CFA.\nElle est actuellement en attente de traitement par notre équipe.\n\nMerci de votre confiance,\nL'équipe GermanLub."
                
                # 2. Email to Manager (Order)
                manager_subject = f"🚨 Nouvelle Commande N° {order.id} !"
                manager_body = f"Bonjour Gérant,\n\nUne nouvelle commande vient d'être passée sur le site :\n\nClient : {order.customer_name}\nTéléphone : {order.customer_phone}\nMontant : {order.total_amount} F CFA\n\nVeuillez vous connecter à l'espace Gérant pour la traiter."

            if order.customer_email:
                customer_email = EmailMessage(
                    customer_subject,
                    customer_body,
                    'lesgermanlub@gmail.com',
                    [order.customer_email],
                )
                customer_email.send(fail_silently=True)

            manager_email = EmailMessage(
                manager_subject,
                manager_body,
                'lesgermanlub@gmail.com',
                ['lesgermanlub@gmail.com'],
            )
            manager_email.send(fail_silently=True)
            print(f"Emails envoyés pour l'ordre/devis {order.id}")
        except Exception as e:
            print("Could not send emails:", e)
        
        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def track(self, request):
        invoice_number = request.data.get('invoice_number', '').strip()
        if not invoice_number:
            return Response({'error': 'Numéro de facture requis.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            # Parse ID from invoice_number e.g. "LES/GERM26-001"
            parts = invoice_number.split('-')
            if len(parts) != 2:
                raise ValueError()
            order_id = int(parts[1])
            order = Order.objects.get(id=order_id)
            
            # Additional security check: ensure it matches exactly the format
            if order.invoice_number != invoice_number:
                raise ValueError()
                
            return Response({
                'invoice_number': order.invoice_number,
                'status': order.status,
                'created_at': order.created_at,
                'total_amount': order.total_amount,
                'customer_name': order.customer_name
            })
        except (ValueError, Order.DoesNotExist):
            return Response({'error': 'Commande introuvable avec ce numéro.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'])
    def download_invoice(self, request, pk=None):
        order = self.get_object()
        filepath = generate_invoice_pdf(order)
        if os.path.exists(filepath):
            safe_invoice_number = order.invoice_number.replace('/', '_')
            return FileResponse(open(filepath, 'rb'), as_attachment=True, filename=f"facture_{safe_invoice_number}.pdf")
        return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'])
    def download_delivery_slip(self, request, pk=None):
        order = self.get_object()
        filepath = generate_delivery_slip_pdf(order)
        if os.path.exists(filepath):
            safe_invoice_number = order.invoice_number.replace('/', '_')
            return FileResponse(open(filepath, 'rb'), as_attachment=True, filename=f"bordereau_{safe_invoice_number}.pdf")
        return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)

    def partial_update(self, request, *args, **kwargs):
        order = self.get_object()
        previous_status = order.status
        response = super().partial_update(request, *args, **kwargs)
        
        order.refresh_from_db()
        if previous_status != order.status and order.status == 'VALIDATED':
            try:
                # Generate PDF Invoice
                pdf_path = generate_invoice_pdf(order)
                
                # Send Email Notification with PDF
                subject = f"Facture - Commande {order.invoice_number}"
                body = f"Bonjour {order.customer_name},\n\nVotre commande a été validée avec succès. Vous trouverez votre facture en pièce jointe.\n\nMerci de votre confiance,\nL'équipe Germanlub."
                
                email = EmailMessage(
                    subject,
                    body,
                    'lesgermanlub@gmail.com',
                    [order.customer_email],
                )
                email.attach_file(pdf_path)
                email.send(fail_silently=True)
                print(f"Email avec facture envoyé pour la commande {order.invoice_number}")
            except Exception as e:
                print("Error sending email:", str(e))
        
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

    def perform_update(self, serializer):
        # Check if the order status is changing to CANCELLED
        instance = self.get_object()
        old_status = instance.status
        updated_instance = serializer.save()
        
        if old_status != 'CANCELLED' and updated_instance.status == 'CANCELLED' and not updated_instance.is_quote:
            # Restore stock
            for item in updated_instance.items.all():
                if item.product:
                    item.product.stock += item.quantity
                    item.product.save()

class ContactView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        name = data.get('name')
        email = data.get('email')
        phone = data.get('phone', 'Non renseigné')
        company = data.get('company', 'Non renseignée')
        subject = data.get('subject', 'Demande de contact')
        message = data.get('message')

        if not name or not email or not message:
            return Response({'error': 'Veuillez remplir tous les champs obligatoires.'}, status=status.HTTP_400_BAD_REQUEST)

        email_subject = f"Nouveau message de {name} - {subject}"
        email_body = f"""
Un nouveau message a été envoyé depuis la page Contact du site GermanLub.

Nom : {name}
Email : {email}
Téléphone : {phone}
Entreprise : {company}
Sujet : {subject}

Message :
{message}
"""
        try:
            msg = EmailMessage(
                email_subject,
                email_body,
                'lesgermanlub@gmail.com',
                ['lesgermanlub@gmail.com'] # Send to manager
            )
            msg.send(fail_silently=False)
            return Response({'success': 'Message envoyé avec succès.'})
        except Exception as e:
            logger = logging.getLogger(__name__)
            logger.exception("Erreur lors de l'envoi de l'email de contact: %s", e)
            return Response({'error': "Erreur lors de l'envoi du message. Veuillez réessayer plus tard."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from django.db.models import Sum
        # Basic KPIs
        total_orders = Order.objects.count()
        total_revenue = Order.objects.filter(status='VALIDATED').aggregate(total=Sum('total_amount'))['total'] or 0
        pending_orders = Order.objects.filter(status='PENDING').count()
        low_stock_products = Product.objects.filter(stock__lte=5).values('name', 'stock', 'id')
        
        return Response({
            'total_orders': total_orders,
            'total_revenue': total_revenue,
            'pending_orders': pending_orders,
            'low_stock_products': list(low_stock_products)
        })
