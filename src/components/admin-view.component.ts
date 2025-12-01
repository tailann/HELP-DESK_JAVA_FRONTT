
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../services/auth.service';
import { TicketService } from '../services/ticket.service';

@Component({
  selector: 'app-admin-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8">
      <header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">Visão Geral do Administrador</h2>
          <p class="text-gray-500">Gerencie técnicos e monitore o status global do sistema.</p>
        </div>
        <button (click)="showAddTech = true" class="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition shadow-lg shadow-gray-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          Novo Técnico
        </button>
      </header>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
           <div class="absolute right-0 top-0 h-full w-1 bg-gray-200"></div>
           <div class="text-gray-500 text-sm font-medium mb-1">Total de Chamados</div>
           <div class="text-3xl font-bold text-gray-800">{{ stats().total }}</div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
           <div class="absolute right-0 top-0 h-full w-1 bg-blue-500"></div>
           <div class="text-gray-500 text-sm font-medium mb-1">Chamados Abertos</div>
           <div class="text-3xl font-bold text-blue-600">{{ stats().open }}</div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
           <div class="absolute right-0 top-0 h-full w-1 bg-purple-500"></div>
           <div class="text-gray-500 text-sm font-medium mb-1">Técnicos Ativos</div>
           <div class="text-3xl font-bold text-purple-600">{{ technicians().length }}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        <!-- Tech List -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
          <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 class="font-semibold text-gray-800 flex items-center gap-2">
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              Técnicos Registrados
            </h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-gray-50 text-gray-500">
                <tr>
                  <th class="px-6 py-3 font-medium">Nome</th>
                  <th class="px-6 py-3 font-medium">Email</th>
                  <th class="px-6 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (tech of technicians(); track tech.email) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-6 py-3 font-medium text-gray-800">{{ tech.name }}</td>
                    <td class="px-6 py-3 text-gray-600">{{ tech.email }}</td>
                    <td class="px-6 py-3 text-right">
                       <button class="text-red-500 hover:text-red-700 text-xs font-medium bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition">Remover</button>
                    </td>
                  </tr>
                }
                @empty {
                  <tr>
                     <td colspan="3" class="px-6 py-8 text-center text-gray-400">Nenhum técnico encontrado.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Global Tickets Monitor -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
           <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 class="font-semibold text-gray-800 flex items-center gap-2">
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
              Monitoramento de Chamados
            </h3>
          </div>
          <div class="overflow-x-auto max-h-[400px]">
            <table class="w-full text-left text-sm">
              <thead class="bg-gray-50 text-gray-500 sticky top-0 bg-gray-50 z-10 shadow-sm">
                <tr>
                  <th class="px-6 py-3 font-medium">Assunto</th>
                  <th class="px-6 py-3 font-medium">Status</th>
                  <th class="px-6 py-3 font-medium">Prioridade</th>
                  <th class="px-6 py-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (ticket of allTickets(); track ticket.id) {
                  <tr class="hover:bg-gray-50 transition">
                    <td class="px-6 py-3">
                      <div class="font-medium text-gray-900 truncate max-w-[150px]" title="{{ ticket.title }}">{{ ticket.title }}</div>
                      <div class="text-xs text-gray-500">{{ ticket.createdBy }}</div>
                    </td>
                    <td class="px-6 py-3">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        [class.bg-green-100]="ticket.status === 'Resolved'" [class.text-green-700]="ticket.status === 'Resolved'"
                        [class.bg-yellow-100]="ticket.status === 'In Progress'" [class.text-yellow-700]="ticket.status === 'In Progress'"
                        [class.bg-gray-100]="ticket.status === 'Open'" [class.text-gray-700]="ticket.status === 'Open'"
                        [class.bg-gray-800]="ticket.status === 'Closed'" [class.text-white]="ticket.status === 'Closed'">
                        {{ translateStatus(ticket.status) }}
                      </span>
                    </td>
                    <td class="px-6 py-3">
                       <span [class]="getPriorityClass(ticket.priority) + ' px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider'">
                         {{ translatePriority(ticket.priority) }}
                       </span>
                    </td>
                    <td class="px-6 py-3 text-gray-500 whitespace-nowrap">{{ ticket.createdAt | date:'dd/MM' }}</td>
                  </tr>
                }
                @empty {
                  <tr>
                     <td colspan="4" class="px-6 py-8 text-center text-gray-400">Nenhum chamado registrado.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>

    <!-- Modal -->
    @if (showAddTech) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-down">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 class="text-lg font-bold text-gray-800">Adicionar Técnico</h3>
            <button (click)="showAddTech = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <div class="p-6">
            <form (submit)="createTech($event)">
               <div class="mb-4">
                 <label class="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                 <input type="text" name="newTechName" [(ngModel)]="newTech.name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required placeholder="Ex: Maria Souza">
               </div>
               <div class="mb-4">
                 <label class="block text-sm font-medium text-gray-700 mb-1">Email Corporativo</label>
                 <input type="email" name="newTechEmail" [(ngModel)]="newTech.email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required placeholder="tech@empresa.com">
               </div>
               <div class="mb-6">
                 <label class="block text-sm font-medium text-gray-700 mb-1">Senha de Acesso</label>
                 <input type="password" name="newTechPass" [(ngModel)]="newTech.password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required placeholder="••••••••">
               </div>
               <div class="flex justify-end gap-3 pt-2">
                 <button type="button" (click)="showAddTech = false" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium text-sm">Cancelar</button>
                 <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-sm">Criar Conta</button>
               </div>
            </form>
          </div>
        </div>
      </div>
    }
  `
})
export class AdminViewComponent {
  auth = inject(AuthService);
  ticketService = inject(TicketService);
  
  showAddTech = false;
  newTech = { name: '', email: '', password: '' };

  technicians = computed(() => this.auth.users().filter(u => u.role === 'TECH'));
  allTickets = this.ticketService.getAllTickets();
  
  stats = computed(() => {
    const tickets = this.ticketService.getAllTickets()();
    return {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'Open').length
    };
  });

  async createTech(e: Event) {
    e.preventDefault();
    await this.auth.createTechnician(this.newTech.email, this.newTech.password, this.newTech.name);
    this.showAddTech = false;
    this.newTech = { name: '', email: '', password: '' };
  }

  // Helpers for Ticket Table
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

  getPriorityClass(p: string) {
    switch (p) {
      case 'Critical': return 'bg-red-100 text-red-700';
      case 'High': return 'bg-orange-100 text-orange-700';
      case 'Medium': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  }
}
