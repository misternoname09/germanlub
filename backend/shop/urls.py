from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, OrderViewSet, ForecastView, ReviewViewSet, BlogPostViewSet, CouponValidationView, CouponViewSet, ContactView, VehicleViewSet, DashboardStatsView

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'blog', BlogPostViewSet)
router.register(r'coupons', CouponViewSet)
router.register(r'vehicles', VehicleViewSet)

urlpatterns = [
    path('forecast/', ForecastView.as_view(), name='forecast'),
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('coupons/validate/', CouponValidationView.as_view(), name='coupon-validate'),
    path('contact/', ContactView.as_view(), name='contact'),
    path('', include(router.urls)),
]
