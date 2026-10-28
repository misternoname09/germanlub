import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CatalogComponent } from './pages/catalog/catalog.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { CartComponent } from './pages/cart/cart.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ContactComponent } from './pages/contact/contact.component';
import { authGuard } from './guards/auth.guard';

import { ManagerLayoutComponent } from './pages/manager-layout/manager-layout.component';
import { ManagerDashboardComponent } from './pages/manager-dashboard/manager-dashboard.component';
import { ManagerOrdersComponent } from './pages/manager-orders/manager-orders.component';
import { ManagerProductsComponent } from './pages/manager-products/manager-products.component';
import { ManagerCategoriesComponent } from './pages/manager-categories/manager-categories.component';
import { ManagerCouponsComponent } from './pages/manager-coupons/manager-coupons.component';
import { ManagerReviewsComponent } from './pages/manager-reviews/manager-reviews.component';

import { TrackOrderComponent } from './pages/track-order/track-order.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'catalog', component: CatalogComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'login', component: LoginComponent },
  { path: 'track-order', component: TrackOrderComponent },
  
  // Manager Routes
  { 
    path: 'manager', 
    component: ManagerLayoutComponent, 
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: ManagerDashboardComponent },
      { path: 'orders', component: ManagerOrdersComponent },
      { path: 'products', component: ManagerProductsComponent },
      { path: 'categories', component: ManagerCategoriesComponent },
      { path: 'coupons', component: ManagerCouponsComponent },
      { path: 'reviews', component: ManagerReviewsComponent }
    ]
  },
  
  { path: 'dashboard', redirectTo: 'manager/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];
