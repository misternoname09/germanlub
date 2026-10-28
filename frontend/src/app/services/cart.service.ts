import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  product: any;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartKey = 'germanlub_cart';
  private itemsSubject = new BehaviorSubject<CartItem[]>(this.getInitialCart());
  items$ = this.itemsSubject.asObservable();

  constructor() {
    this.items$.subscribe(items => {
      localStorage.setItem(this.cartKey, JSON.stringify(items));
    });
  }

  private getInitialCart(): CartItem[] {
    const savedCart = localStorage.getItem(this.cartKey);
    return savedCart ? JSON.parse(savedCart) : [];
  }

  addToCart(product: any, quantity: number = 1) {
    const currentItems = this.itemsSubject.value;
    const existingItem = currentItems.find(i => i.product.id === product.id);

    const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;
    
    if (newQuantity > product.stock) {
      alert(`Désolé, nous n'avons que ${product.stock} exemplaires en stock pour ce produit.`);
      return;
    }

    if (existingItem) {
      existingItem.quantity += quantity;
      this.itemsSubject.next([...currentItems]);
    } else {
      this.itemsSubject.next([...currentItems, { product, quantity }]);
    }
  }

  removeFromCart(productId: number) {
    const currentItems = this.itemsSubject.value;
    this.itemsSubject.next(currentItems.filter(i => i.product.id !== productId));
  }

  clearCart() {
    this.itemsSubject.next([]);
    localStorage.removeItem(this.cartKey);
  }

  getTotalPrice(): number {
    return this.itemsSubject.value.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  getItemCount(): number {
    return this.itemsSubject.value.reduce((total, item) => total + item.quantity, 0);
  }
}
