import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed bottom-4 right-4 z-50">
      <!-- Chat Button -->
      <button *ngIf="!isOpen" (click)="toggleChat()" class="bg-brand text-white p-4 rounded-full shadow-lg hover:bg-brand-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      <!-- Chat Window -->
      <div *ngIf="isOpen" class="bg-white w-80 sm:w-96 rounded-lg shadow-xl border border-gray-200 flex flex-col overflow-hidden" style="height: 500px; max-height: 80vh;">
        <!-- Header -->
        <div class="bg-brand text-white p-4 flex justify-between items-center shadow-md z-10">
          <div class="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
            </svg>
            <span class="font-medium">Assistant GermanLub</span>
          </div>
          <button (click)="toggleChat()" class="text-white hover:text-gray-200 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <!-- Messages Area -->
        <div class="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4" #scrollMe>
          <div *ngFor="let msg of messages">
            
            <!-- Bot Message -->
            <div *ngIf="msg.sender === 'bot'" class="flex items-start">
              <div class="flex-shrink-0 h-8 w-8 rounded-full bg-brand flex items-center justify-center text-white text-xs font-bold">
                GL
              </div>
              <div class="ml-3 bg-white p-3 rounded-lg rounded-tl-none shadow-sm text-sm text-gray-700 border border-gray-200 whitespace-pre-line">
                {{ msg.text }}
              </div>
            </div>
            
            <!-- User Message -->
            <div *ngIf="msg.sender === 'user'" class="flex items-end justify-end">
              <div class="mr-3 bg-gray-800 p-3 rounded-lg rounded-tr-none shadow-sm text-sm text-white whitespace-pre-line">
                {{ msg.text }}
              </div>
            </div>

          </div>
          <div *ngIf="isTyping" class="flex items-start">
            <div class="flex-shrink-0 h-8 w-8 rounded-full bg-brand flex items-center justify-center text-white text-xs font-bold">GL</div>
            <div class="ml-3 bg-white p-3 rounded-lg rounded-tl-none shadow-sm text-sm text-gray-400 border border-gray-200 flex space-x-1">
              <span class="animate-bounce">.</span><span class="animate-bounce" style="animation-delay: 0.2s">.</span><span class="animate-bounce" style="animation-delay: 0.4s">.</span>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="p-3 bg-white border-t border-gray-200 flex items-center space-x-2">
          <input type="text" [(ngModel)]="newMessage" (keyup.enter)="sendMessage()" placeholder="Posez votre question..." class="flex-1 border-gray-300 rounded-full pl-4 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand text-sm bg-gray-100 text-gray-900">
          <button (click)="sendMessage()" [disabled]="!newMessage.trim()" class="bg-brand text-white rounded-full p-2 hover:bg-brand-dark focus:outline-none disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ChatbotComponent implements AfterViewChecked {
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;
  isOpen = false;
  newMessage = '';
  isTyping = false;

  messages: ChatMessage[] = [
    { sender: 'bot', text: "Bonjour ! Je suis l'assistant intelligent GermanLub. Comment puis-je vous aider aujourd'hui ?" }
  ];

  toggleChat() {
    this.isOpen = !this.isOpen;
    this.scrollToBottom();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      if (this.myScrollContainer) {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      }
    } catch(err) { }
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const userText = this.newMessage.trim();
    this.messages.push({ sender: 'user', text: userText });
    this.newMessage = '';
    this.isTyping = true;

    // Simulate network delay
    setTimeout(() => {
      this.isTyping = false;
      this.messages.push({ sender: 'bot', text: this.getBotResponse(userText) });
    }, 1000);
  }

  private getBotResponse(input: string): string {
    const text = input.toLowerCase();

    if (text.includes('bonjour') || text.includes('salut')) {
      return "Bonjour ! Comment puis-je vous être utile ?";
    }
    if (text.includes('devis')) {
      return "Vous pouvez demander un devis directement depuis le Panier. Ajoutez vos produits, allez dans le panier, et cliquez sur 'Demander un Devis'.";
    }
    if (text.includes('contact') || text.includes('téléphone') || text.includes('appeler')) {
      return "Vous pouvez nous joindre par téléphone ou WhatsApp au +221 78 717 18 18 ou par email à contact@germanlub.com.";
    }
    if (text.includes('huile') || text.includes('moteur') || text.includes('lubrifiant') || text.includes('produit')) {
      return "Nous proposons une large gamme de lubrifiants de haute qualité (5W30, 15W40, etc.). Je vous invite à visiter la page Catalogue pour voir nos produits.";
    }
    if (text.includes('livraison') || text.includes('livrer')) {
      return "Nous livrons partout au Sénégal. Les frais de livraison dépendent de votre adresse et seront précisés lors de la validation de la commande.";
    }
    if (text.includes('prix') || text.includes('combien') || text.includes('tarif') || text.includes('coût')) {
      return "Nos prix varient en fonction de la viscosité (ex: SAE 50, 15W40) et du conditionnement (20L, Fût 200L, etc.). Vous pouvez consulter tous nos tarifs directement dans la rubrique Catalogue !";
    }
    if (text.includes('adresse') || text.includes('localisation') || text.includes('où') || text.includes('situer') || text.includes('trouver')) {
      return "GermanLub est distribué au Sénégal par Lubricants Engineering Solutions (LES). Contactez-nous pour connaître le point de vente le plus proche de chez vous !";
    }
    if (text.includes('horaire') || text.includes('heure') || text.includes('ouvert') || text.includes('fermé')) {
      return "Nous sommes à votre disposition du Lundi au Vendredi de 08h00 à 17h00, et le Samedi de 08h00 à 13h00.";
    }
    if (text.includes('conseil') || text.includes('quelle huile') || text.includes('choisir')) {
      return "Le choix de l'huile dépend de votre moteur. Sur notre page Catalogue, utilisez les filtres 'Véhicule' et 'Motorisation' pour trouver l'huile recommandée, ou contactez-nous sur WhatsApp pour un conseil d'expert gratuit !";
    }
    if (text.includes('sae 50') || text.includes('15w40') || text.includes('10w40') || text.includes('5w30') || text.includes('5w40') || text.includes('viscosité')) {
      if (text.includes('xtreme') || text.includes('gl-xtreme') || text.includes('caractéristique')) {
        return "Le GL-XTREME SAE 50 (API CF/CD/SF) est une huile minérale monograde de haute qualité. Idéale pour les moteurs diesel (utilitaires, commerciaux) et essence (jusqu'à Euro 2) dans des conditions difficiles. Caractéristiques clés : Excellente résistance à l'usure, Point d'éclair 230°C, Point d'écoulement -15°C. Retrouvez la fiche complète en PDF sur la page produit !";
      }
      return "Nous disposons de ces viscosités en stock ! Visitez notre Catalogue et utilisez le filtre 'Viscosité' pour voir les conditionnements disponibles (Cartons 4x5L, Bidons 20L, Fûts 200L).";
    }
    if (text.includes('xtreme') || text.includes('gl-xtreme') || text.includes('gl xtreme')) {
        return "Le GL-XTREME SAE 50 (API CF/CD/SF) est une huile minérale monograde très performante. Elle est recommandée pour les moteurs diesel suralimentés et les moteurs à essence dans des conditions difficiles. Elle offre une protection anti-usure exceptionnelle et une grande stabilité thermique.";
    }
    if (text.includes('fiche technique') || text.includes('pdf')) {
      return "Les fiches techniques (PDF) détaillées de nos huiles sont téléchargeables directement sur la page de chaque produit. Cliquez sur un produit dans le catalogue pour y accéder !";
    }
    if (text.includes('merci') || text.includes('super') || text.includes('top')) {
      return "C'est un plaisir de vous aider ! N'hésitez pas si vous avez d'autres questions.";
    }

    return "Je suis un assistant virtuel basique. Pour une demande spécifique, veuillez cliquer sur l'icône WhatsApp (en bas à gauche) pour parler directement à notre équipe commerciale !";
  }
}
