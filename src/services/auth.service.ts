
import { Injectable, signal, computed } from '@angular/core';

export interface User {
  email: string;
  name: string;
  password?: string;
  role: 'ADMIN' | 'TECH' | 'CLIENT';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usersKey = 'helpdesk_users';
  private sessionKey = 'helpdesk_session';

  // State
  private usersSignal = signal<User[]>(this.loadUsers());
  private currentUserSignal = signal<User | null>(this.loadSession());

  // Selectors
  currentUser = computed(() => this.currentUserSignal());
  users = computed(() => this.usersSignal());

  constructor() {
    this.seedUsers();
  }

  private loadUsers(): User[] {
    try {
      const data = localStorage.getItem(this.usersKey);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  }

  private loadSession(): User | null {
    try {
      const data = localStorage.getItem(this.sessionKey);
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  }

  private saveUsers(users: User[]) {
    localStorage.setItem(this.usersKey, JSON.stringify(users));
    this.usersSignal.set(users);
  }

  private seedUsers() {
    let users = this.usersSignal();
    let changed = false;
    
    // 1. Conta Admin
    if (!users.find(u => u.email === 'admin@helpdesk.com')) {
      users = [...users, { 
        email: 'admin@helpdesk.com', 
        name: 'Administrador do Sistema', 
        password: 'admin', 
        role: 'ADMIN' 
      }];
      changed = true;
    }

    // 2. Conta Técnico
    if (!users.find(u => u.email === 'tecnico@helpdesk.com')) {
      users = [...users, { 
        email: 'tecnico@helpdesk.com', 
        name: 'Roberto Técnico', 
        password: '123', 
        role: 'TECH' 
      }];
      changed = true;
    }

    // 3. Conta Cliente
    if (!users.find(u => u.email === 'cliente@helpdesk.com')) {
      users = [...users, { 
        email: 'cliente@helpdesk.com', 
        name: 'Ana Cliente', 
        password: '123', 
        role: 'CLIENT' 
      }];
      changed = true;
    }
    
    if (changed) this.saveUsers(users);
  }

  async login(email: string, pass: string): Promise<boolean> {
    const user = this.usersSignal().find(u => u.email === email && u.password === pass);
    if (user) {
      this.currentUserSignal.set(user);
      localStorage.setItem(this.sessionKey, JSON.stringify(user));
      return true;
    }
    return false;
  }

  async register(email: string, pass: string, name: string, role: 'ADMIN' | 'TECH' | 'CLIENT' = 'CLIENT'): Promise<boolean> {
    if (this.usersSignal().some(u => u.email === email)) {
      return false;
    }
    const newUser: User = { email, password: pass, name, role };
    this.saveUsers([...this.usersSignal(), newUser]);
    
    // Auto-login only for public client registration
    if (role === 'CLIENT') {
      this.currentUserSignal.set(newUser);
      localStorage.setItem(this.sessionKey, JSON.stringify(newUser));
    }
    
    return true;
  }
  
  async createTechnician(email: string, pass: string, name: string): Promise<boolean> {
    if (this.usersSignal().some(u => u.email === email)) return false;
    
    const newUser: User = { email, password: pass, name, role: 'TECH' };
    this.saveUsers([...this.usersSignal(), newUser]);
    return true;
  }

  logout() {
    this.currentUserSignal.set(null);
    localStorage.removeItem(this.sessionKey);
  }
}
