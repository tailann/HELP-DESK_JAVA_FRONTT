
import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { AdminViewComponent } from './admin-view.component';
import { TechViewComponent } from './tech-view.component';
import { ClientViewComponent } from './client-view.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminViewComponent, TechViewComponent, ClientViewComponent],
  template: `
    <div class="min-h-screen flex flex-col md:flex-row">
      <!-- Sidebar -->
      <aside class="bg-gray-900 text-white flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out overflow-hidden"
             [class.w-full]="true" 
             [class.md:w-64]="!isSidebarCollapsed()" 
             [class.md:w-20]="isSidebarCollapsed()">
        
        <div class="p-4 md:p-6 flex flex-col h-full">
          <!-- Header with Toggle -->
          <div class="flex items-center mb-8 h-10" [class.justify-center]="isSidebarCollapsed()" [class.justify-between]="!isSidebarCollapsed()">
             <button (click)="toggleSidebar()" class="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800 transition focus:outline-none flex-shrink-0" title="Alternar Menu">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
             </button>

             <div class="flex items-center gap-3 overflow-hidden whitespace-nowrap ml-3" [class.w-0]="isSidebarCollapsed()" [class.opacity-0]="isSidebarCollapsed()" [class.hidden]="isSidebarCollapsed()">
                <div class="w-8 h-8 rounded bg-blue-500 flex items-center justify-center font-bold text-sm">HD</div>
                <span class="text-lg font-bold tracking-tight">Helpdesk</span>
             </div>
          </div>
          
          <!-- User Profile -->
          <div class="mb-8 transition-all duration-300" [class.items-center]="isSidebarCollapsed()">
             <div class="flex items-center gap-3 p-2 bg-gray-800 rounded-lg overflow-hidden h-14" [class.justify-center]="isSidebarCollapsed()">
              <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center text-xs font-bold" title="{{ auth.currentUser()?.name }}">
                {{ userInitials() }}
              </div>
              <div class="overflow-hidden flex flex-col justify-center" [class.w-0]="isSidebarCollapsed()" [class.opacity-0]="isSidebarCollapsed()" [class.hidden]="isSidebarCollapsed()">
                <p class="text-sm font-medium truncate whitespace-nowrap">{{ auth.currentUser()?.name }}</p>
                <p class="text-xs text-gray-400 capitalize whitespace-nowrap">{{ getRoleName(auth.currentUser()?.role) }}</p>
              </div>
            </div>
          </div>

          <nav class="space-y-1">
             <a routerLink="/dashboard" class="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-gray-800 text-white cursor-pointer hover:bg-gray-700 transition h-10 overflow-hidden" [class.justify-center]="isSidebarCollapsed()" title="Painel">
               <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
               <span class="whitespace-nowrap" [class.hidden]="isSidebarCollapsed()">Painel</span>
             </a>
          </nav>
        
          <div class="mt-auto space-y-2 pt-4 border-t border-gray-800">
             <!-- Github Link -->
             <a href="https://github.com/tailann/HELP-DESK_JAVA_FRONT" target="_blank" class="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition h-10 overflow-hidden" [class.justify-center]="isSidebarCollapsed()" title="Repositório GitHub">
                <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                <span class="whitespace-nowrap" [class.hidden]="isSidebarCollapsed()">GitHub</span>
             </a>

             <!-- Logout -->
             <button (click)="logout()" class="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition h-10 overflow-hidden" [class.justify-center]="isSidebarCollapsed()" title="Sair">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                <span class="whitespace-nowrap" [class.hidden]="isSidebarCollapsed()">Sair</span>
             </button>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 overflow-auto bg-gray-50 p-6 md:p-10">
        @switch (auth.currentUser()?.role) {
          @case ('ADMIN') {
            <app-admin-view></app-admin-view>
          }
          @case ('TECH') {
            <app-tech-view></app-tech-view>
          }
          @case ('CLIENT') {
            <app-client-view></app-client-view>
          }
          @default {
             <div class="flex items-center justify-center h-full text-gray-400">Carregando perfil...</div>
          }
        }
      </main>
    </div>
  `
})
export class DashboardComponent {
  auth = inject(AuthService);
  router: Router = inject(Router);

  isSidebarCollapsed = signal(false);

  toggleSidebar() {
    this.isSidebarCollapsed.update(v => !v);
  }

  userInitials = computed(() => {
    const name = this.auth.currentUser()?.name || '';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  });

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  getRoleName(role: string | undefined): string {
    switch (role) {
      case 'ADMIN': return 'Administrador';
      case 'TECH': return 'Técnico';
      case 'CLIENT': return 'Cliente';
      default: return '';
    }
  }
}
