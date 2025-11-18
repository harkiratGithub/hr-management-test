import { Component, computed, signal, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { filter } from 'rxjs/operators';
import { TopbarComponent } from './shared/layout/topbar';
import { IdleService } from './core/services/idle.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopbarComponent, NgIf],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('employee-recruitment-dashboard');
  // Instantiate IdleService at app root to start global inactivity tracking
  private readonly idle = inject(IdleService);

  constructor(private readonly router: Router) {
    this.currentUrl.set(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.currentUrl.set(this.router.url));
  }

  private readonly currentUrl = signal('');

  readonly showTopbar = computed(() => !this.currentUrl().startsWith('/auth'));
}
