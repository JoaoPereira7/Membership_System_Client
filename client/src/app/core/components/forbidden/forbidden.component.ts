import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-forbidden',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <section class="forbidden">
      <mat-icon>lock</mat-icon>
      <h1>Acesso não autorizado</h1>
      <p>Seu perfil não possui permissão para acessar esta página.</p>
      <a mat-flat-button routerLink="/">Voltar ao início</a>
    </section>
  `,
  styles: `
    .forbidden { min-height: 60vh; display: grid; place-content: center; justify-items: center; gap: 12px; text-align: center; }
    mat-icon { width: 56px; height: 56px; font-size: 56px; color: #6b7280; }
    h1, p { margin: 0; }
    p { color: #6b7280; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForbiddenComponent {}
