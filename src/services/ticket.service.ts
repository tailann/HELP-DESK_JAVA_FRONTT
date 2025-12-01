
import { Injectable, signal, computed } from '@angular/core';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  category: string;
  createdBy: string; // user email
  assignedTo?: string; // tech email
  createdAt: number;
  aiSummary?: string;
  solution?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private storageKey = 'helpdesk_tickets';
  
  // State
  private ticketsSignal = signal<Ticket[]>(this.loadTickets());

  // Selectors
  tickets = computed(() => this.ticketsSignal());

  constructor() {
    this.seedTickets();
  }

  private loadTickets(): Ticket[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  private saveTickets(tickets: Ticket[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(tickets));
    this.ticketsSignal.set(tickets);
  }

  private seedTickets() {
    const current = this.ticketsSignal();
    if (current.length === 0) {
      const mocks: Ticket[] = [
        {
          id: 'MOCK-101',
          title: 'Impressora não conecta na rede',
          description: 'A impressora do 3º andar está piscando uma luz vermelha e não aparece na lista de dispositivos de rede.',
          status: 'Open',
          priority: 'Medium',
          category: 'Hardware',
          createdBy: 'cliente@helpdesk.com',
          createdAt: Date.now() - 86400000, // 1 dia atrás
          aiSummary: 'Falha de conexão de hardware na impressora.'
        },
        {
          id: 'MOCK-102',
          title: 'Erro ao acessar VPN',
          description: 'Estou tentando conectar de casa e recebo o erro 800. Preciso disso urgente para a reunião.',
          status: 'In Progress',
          priority: 'High',
          category: 'Network',
          createdBy: 'cliente@helpdesk.com',
          createdAt: Date.now() - 3600000, // 1 hora atrás
          aiSummary: 'Erro de conexão VPN remoto crítico.'
        }
      ];
      this.saveTickets(mocks);
    }
  }

  createTicket(ticket: Omit<Ticket, 'id' | 'createdAt' | 'status'>) {
    const newTicket: Ticket = {
      ...ticket,
      id: Math.random().toString(36).substring(2, 9).toUpperCase(),
      createdAt: Date.now(),
      status: 'Open'
    };
    this.saveTickets([newTicket, ...this.ticketsSignal()]);
    return newTicket;
  }

  updateTicket(id: string, updates: Partial<Ticket>) {
    const currentTickets = this.ticketsSignal();
    const index = currentTickets.findIndex(t => t.id === id);
    if (index !== -1) {
      const updatedTickets = [...currentTickets];
      updatedTickets[index] = { ...updatedTickets[index], ...updates };
      this.saveTickets(updatedTickets);
    }
  }

  getTicketsByCreator(email: string) {
    return computed(() => this.ticketsSignal().filter(t => t.createdBy === email));
  }

  getAllTickets() {
    return this.tickets;
  }
}
