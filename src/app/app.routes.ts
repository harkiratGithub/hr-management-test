import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login')
      }
    ]
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard')
  },
  {
    path: 'employees',
    canActivate: [authGuard, roleGuard],
    loadComponent: () => import('./features/employees/employees'),
    data: { roles: ['HR', 'SuperAdmin'] },
    canActivateChild: [roleGuard]
  },
  {
    path: 'applications',
    canActivate: [authGuard],
    loadComponent: () => import('./features/applications/applications')
  },
  {
    path: 'departments',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SuperAdmin'] },
    loadComponent: () => import('./features/departments/departments')
  },
  {
    path: 'documents',
    canActivate: [authGuard],
    loadComponent: () => import('./features/documents/documents')
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
