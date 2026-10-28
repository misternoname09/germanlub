import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from './services/cart.service';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { WhatsAppButtonComponent } from './components/whatsapp-button/whatsapp-button.component';
import { AuthService } from './services/auth.service';
import { TranslatePipe, TranslateDirective, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, ChatbotComponent, WhatsAppButtonComponent, TranslatePipe, TranslateDirective],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'frontend';
  cartCount = 0;
  isDarkMode = false;
  isManagerOrLoginRoute = false;
  currentLang = 'fr';

  isMobileMenuOpen = false;

  constructor(
    private cartService: CartService, 
    private router: Router,
    private translate: TranslateService,
    public authService: AuthService
  ) {
    this.translate.use('fr');
  }

  ngOnInit() {
    this.cartService.items$.subscribe(items => {
      this.cartCount = this.cartService.getItemCount();
    });

    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        this.isDarkMode = true;
        document.documentElement.classList.add('dark');
      }
    }

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isManagerOrLoginRoute = event.urlAfterRedirects.startsWith('/manager') || event.urlAfterRedirects.startsWith('/login');
        // Close mobile menu on navigation
        this.isMobileMenuOpen = false;
      }
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
    this.currentLang = lang;
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  onSearch(event: any) {
    const query = event.target.value.trim();
    if (query) {
      this.router.navigate(['/catalog'], { queryParams: { search: query } });
    } else {
      this.router.navigate(['/catalog']);
    }
  }
}
