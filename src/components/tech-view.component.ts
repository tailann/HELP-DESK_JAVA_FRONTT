
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService, Ticket } from '../services/ticket.service';
import { GeminiService } from '../services/gemini.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-tech-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col">
      <header class="mb-6">
         <h2 class="text-2xl font-bold text-gray-800">Painel do Técnico</h2>
         <p class="text-gray-500">Resolva chamados e gerencie solicitações de suporte.</p>
      </header>

      <div class="flex gap-6 h-full overflow-hidden">
        <!-- Ticket List -->
        <div class="w-1/3 flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div class="p-4 border-b border-gray-100 bg-gray-50">
            <h3 class="font-semibold text-gray-700">Fila de Chamados</h3>
          </div>
          <div class="overflow-y-auto flex-1 p-2 space-y-2">
            @for (ticket of tickets(); track ticket.id) {
              <div (click)="selectTicket(ticket)" 
                   [class.bg-blue-50]="selectedTicket()?.id === ticket.id"
                   [class.border-blue-200]="selectedTicket()?.id === ticket.id"
                   class="p-3 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-50 transition">
                <div class="flex justify-between items-start mb-1">
                  <span [class]="getPriorityClass(ticket.priority) + ' px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider'">{{ translatePriority(ticket.priority) }}</span>
                  <span class="text-xs text-gray-400">{{ ticket.createdAt | date:'shortDate' }}</span>
                </div>
                <h4 class="font-medium text-gray-800 text-sm mb-1 truncate">{{ ticket.title }}</h4>
                <p class="text-xs text-gray-500 truncate">{{ translateCategory(ticket.category) }}</p>
                <div class="mt-2 flex items-center justify-between">
                   <span class="text-xs font-medium px-2 py-0.5 rounded-full"
                     [class.bg-green-100]="ticket.status === 'Resolved'" [class.text-green-700]="ticket.status === 'Resolved'"
                     [class.bg-yellow-100]="ticket.status === 'In Progress'" [class.text-yellow-700]="ticket.status === 'In Progress'"
                     [class.bg-gray-100]="ticket.status === 'Open'" [class.text-gray-700]="ticket.status === 'Open'"
                     [class.bg-gray-800]="ticket.status === 'Closed'" [class.text-white]="ticket.status === 'Closed'">
                     {{ translateStatus(ticket.status) }}
                   </span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Detail View -->
        <div class="w-2/3 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
          @if (selectedTicket(); as ticket) {
            <div class="flex-1 overflow-y-auto p-6">
              <div class="flex justify-between items-start mb-6">
                <div>
                   <h2 class="text-xl font-bold text-gray-800">{{ ticket.title }}</h2>
                   <div class="flex items-center gap-2 mt-2 text-sm text-gray-500">
                     <span>De: {{ ticket.createdBy }}</span>
                     <span>&bull;</span>
                     <span>ID: #{{ ticket.id }}</span>
                   </div>
                </div>
                <div class="flex gap-2">
                  <select [ngModel]="ticket.status" (ngModelChange)="updateStatus($event)" class="text-sm border rounded-lg px-2 py-1 bg-white">
                    <option value="Open">Aberto</option>
                    <option value="In Progress">Em Andamento</option>
                    <option value="Resolved">Resolvido</option>
                    <option value="Closed">Fechado</option>
                  </select>
                </div>
              </div>

              <!-- AI Analysis Card -->
              <div class="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  <h3 class="font-semibold text-indigo-900">Análise da IA</h3>
                </div>
                <p class="text-sm text-indigo-800 mb-2">{{ ticket.aiSummary || 'Nenhum resumo disponível.' }}</p>
                <div class="flex gap-2 text-xs">
                   <span class="bg-white/50 px-2 py-1 rounded text-indigo-700 font-medium">Categoria: {{ translateCategory(ticket.category) }}</span>
                   <span class="bg-white/50 px-2 py-1 rounded text-indigo-700 font-medium">Prioridade: {{ translatePriority(ticket.priority) }}</span>
                </div>
              </div>

              <div class="mb-6">
                <h3 class="font-semibold text-gray-800 mb-2">Descrição</h3>
                <p class="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{{ ticket.description }}</p>
              </div>
              
              <div class="mb-6">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="font-semibold text-gray-800">Solução Recomendada</h3>
                  @if (!ticket.solution) {
                    <button (click)="generateSolution(ticket)" [disabled]="loadingSolution()" class="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1">
                      @if (loadingSolution()) { Gerando... } @else { ✨ Gerar com IA }
                    </button>
                  }
                </div>
                @if (ticket.solution) {
                   <div class="bg-green-50 border border-green-100 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                     {{ ticket.solution }}
                   </div>
                } @else {
                  <div class="p-4 border border-dashed border-gray-300 rounded-lg text-center text-sm text-gray-400">
                    Nenhuma solução gerada ainda. Clique no botão de IA acima.
                  </div>
                }
              </div>

            </div>
          } @else {
            <div class="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
              <svg class="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              <p>Selecione um chamado da fila para ver os detalhes.</p>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class TechViewComponent {
  ticketService = inject(TicketService);
  geminiService = inject(GeminiService);
  
  tickets = this.ticketService.getAllTickets();
  selectedTicket = signal<Ticket | null>(null);
  loadingSolution = signal(false);

  selectTicket(ticket: Ticket) {
    this.selectedTicket.set(ticket);
  }

  getPriorityClass(p: string) {
    switch (p) {
      case 'Critical': return 'bg-red-100 text-red-700';
      case 'High': return 'bg-orange-100 text-orange-700';
      case 'Medium': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  translateStatus(status: string): string {
    const map: Record<string, string> = {
      'Open': 'Aberto',
      'In Progress': 'Em Andamento',
      'Resolved': 'Resolvido',
      'Closed': 'Fechado'
    };
    return map[status] || status;
  }

  translatePriority(priority: string): string {
    const map: Record<string, string> = {
      'Low': 'Baixa',
      'Medium': 'Média',
      'High': 'Alta',
      'Critical': 'Crítica'
    };
    return map[priority] || priority;
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

  updateStatus(newStatus: any) {
    const t = this.selectedTicket();
    if (t) {
      this.ticketService.updateTicket(t.id, { status: newStatus });
      this.selectedTicket.set({ ...t, status: newStatus });
    }
  }

  async generateSolution(ticket: Ticket) {
    this.loadingSolution.set(true);
    const solution = await this.geminiService.suggestSolution(ticket.title, ticket.description, ticket.aiSummary || '');
    this.ticketService.updateTicket(ticket.id, { solution });
    this.selectedTicket.set({ ...ticket, solution });
    this.loadingSolution.set(false);
  }
}