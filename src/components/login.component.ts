
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div class="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
        
        <div class="p-6">
          <div class="text-center mb-4">
            <h1 class="text-2xl font-bold text-gray-800">Helpdesk</h1>
            
            <div class="mt-4 mb-4">
               <img src="https://picsum.photos/400/400?random=1" alt="Login Illustration" class="w-full aspect-square object-cover rounded-lg shadow-sm">
            </div>
          </div>

          @if (error()) {
            <div class="mb-4 p-2 bg-red-100 text-red-700 rounded-lg text-xs flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {{ error() }}
            </div>
          }

          <form (submit)="onSubmit($event)">
            @if (isRegistering()) {
              <div class="mb-3">
                <label class="block text-xs font-medium text-gray-700 mb-1">Nome Completo</label>
                <input type="text" [(ngModel)]="name" name="name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm" required placeholder="João Silva">
              </div>
            }

            <div class="mb-3">
              <label class="block text-xs font-medium text-gray-700 mb-1">Endereço de Email</label>
              <input type="email" [(ngModel)]="email" name="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm" required placeholder="nome@empresa.com">
            </div>

            <div class="mb-5">
              <label class="block text-xs font-medium text-gray-700 mb-1">Senha</label>
              <input type="password" [(ngModel)]="password" name="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm" required placeholder="••••••••">
            </div>

            <button type="submit" [disabled]="loading()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition duration-200 flex items-center justify-center text-sm">
              @if (loading()) {
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Processando...
              } @else {
                {{ isRegistering() ? 'Criar Conta' : 'Entrar' }}
              }
            </button>
          </form>

          <div class="mt-4 text-center">
            <button (click)="toggleMode()" class="text-xs text-blue-600 hover:text-blue-800 font-medium">
              {{ isRegistering() ? 'Já tem uma conta? Entrar' : 'Precisa de ajuda? Criar conta de cliente' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  authService = inject(AuthService);
  router: Router = inject(Router);

  isRegistering = signal(false);
  email = '';
  password = '';
  name = '';
  error = signal('');
  loading = signal(false);

  toggleMode() {
    this.isRegistering.update(v => !v);
    this.error.set('');
  }

  async onSubmit(e: Event) {
    e.preventDefault();
    this.error.set('');
    this.loading.set(true);

    try {
      if (this.isRegistering()) {
        const success = await this.authService.register(this.email, this.password, this.name);
        if (success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.error.set('Falha no registro. Email pode já estar em uso.');
        }
      } else {
        const success = await this.authService.login(this.email, this.password);
        if (success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.error.set('Credenciais inválidas');
        }
      }
    } catch (err) {
      this.error.set('Ocorreu um erro inesperado');
    } finally {
      this.loading.set(false);
    }
  }
}
