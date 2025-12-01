
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../services/ticket.service';
import { AuthService } from '../services/auth.service';
import { GeminiService } from '../services/gemini.service';

@Component({
  selector: 'app-client-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto">
      <header class="flex justify-between items-center mb-8">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">Meus Chamados</h2>
          <p class="text-gray-500">Acompanhe suas solicitações de suporte e abra novas.</p>
        </div>
        <button (click)="isCreating = true" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm font-medium flex items-center gap-2 transition">
           <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
           Abrir Novo Chamado
        </button>
      </header>

      @if (isCreating) {
        <div class="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8 animate-fade-in-down">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Criar Chamado de Suporte</h3>
          <form (submit)="submitTicket($event)">
             <div class="mb-4">
               <label class="block text-sm font-medium text-gray-700 mb-1">Título</label>
               <input type="text" [(ngModel)]="newTicket.title" name="title" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="ex: Não consigo acessar a VPN" required>
             </div>
             
             <div class="mb-4">
               <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
               <textarea [(ngModel)]="newTicket.description" name="description" rows="4" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Descreva o problema detalhadamente..." required></textarea>
               <p class="text-xs text-gray-400 mt-1">A IA irá categorizar e priorizar automaticamente sua solicitação com base nesta descrição.</p>
             </div>

             <div class="flex justify-end gap-3">
               <button type="button" (click)="isCreating = false" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancelar</button>
               <button type="submit" [disabled]="submitting()" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center font-medium">
                 @if (submitting()) {
                   <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   Analisando...
                 } @else {
                   Enviar Chamado
                 }
               </button>
             </div>
          </form>
        </div>
      }

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 text-gray-500 border-b border-gray-100">
              <tr>
                 <th class="px-6 py-4 font-medium">Chamado</th>
                 <th class="px-6 py-4 font-medium">Categoria</th>
                 <th class="px-6 py-4 font-medium">Data</th>
                 <th class="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (ticket of myTickets(); track ticket.id) {
                <tr class="hover:bg-gray-50 transition">
                  <td class="px-6 py-4">
                    <div class="font-medium text-gray-900">{{ ticket.title }}</div>
                    <div class="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{{ ticket.aiSummary || ticket.description }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                      {{ translateCategory(ticket.category) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-gray-500">{{ ticket.createdAt | date:'mediumDate' }}</td>
                  <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      [class.bg-green-100]="ticket.status === 'Resolved'" [class.text-green-700]="ticket.status === 'Resolved'"
                      [class.bg-yellow-100]="ticket.status === 'In Progress'" [class.text-yellow-700]="ticket.status === 'In Progress'"
                      [class.bg-gray-100]="ticket.status === 'Open'" [class.text-gray-700]="ticket.status === 'Open'"
                      [class.bg-gray-800]="ticket.status === 'Closed'" [class.text-white]="ticket.status === 'Closed'">
                      {{ translateStatus(ticket.status) }}
                    </span>
                  </td>
                </tr>
              }
              @empty {
                <tr>
                   <td colspan="4" class="px-6 py-12 text-center text-gray-400 flex flex-col items-center">
                     <svg class="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                     Nenhum chamado ainda. Abra um acima!
                   </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ClientViewComponent {
  ticketService = inject(TicketService);
  auth = inject(AuthService);
  geminiService = inject(GeminiService);

  isCreating = false;
  submitting = signal(false);
  newTicket = { title: '', description: '' };

  myTickets = this.ticketService.getTicketsByCreator(this.auth.currentUser()?.email || '');

  translateStatus(status: string): string {
    const map: Record<string, string> = {
      'Open': 'Aberto',
      'In Progress': 'Em Andamento',
      'Resolved': 'Resolvido',
      'Closed': 'Fechado'
    };
    return map[status] || status;
  }

  translateCategory(category: string): string {
    const map: Record<string, string> = {
      'Hardware': 'Hardware',
      'Software': 'Software',
      'Network': 'Rede',
      'Access': 'Acesso',
      'Other': 'Outro'
    };
    return map[category] || category;
  }

  async submitTicket(e: Event) {
    e.preventDefault();
    this.submitting.set(true);
    
    // AI Triage
    const analysis = await this.geminiService.triageTicket(this.newTicket.description, this.newTicket.title);

    this.ticketService.createTicket({
      title: this.newTicket.title,
      description: this.newTicket.description,
      priority: analysis.priority as any,
      category: analysis.category,
      aiSummary: analysis.summary,
      createdBy: this.auth.currentUser()?.email || 'unknown'
    });

    this.isCreating = false;
    this.submitting.set(false);
    this.newTicket = { title: '', description: '' };
  }
}