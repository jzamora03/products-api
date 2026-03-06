import { Routes } from '@angular/router';
import { AuthGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./auth/pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'products',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./products/pages/products-list/products-list.component').then((m) => m.ProductsListComponent),
      },
      {
        path: 'new',
        loadComponent: () => import('./products/pages/product-form/product-form.component').then((m) => m.ProductFormComponent),
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./products/pages/product-form/product-form.component').then((m) => m.ProductFormComponent),
      },
      {
        path: ':id',
        loadComponent: () => import('./products/pages/product-detail/product-detail.component').then((m) => m.ProductDetailComponent),
      },
    ],
  },
  { path: '**', redirectTo: '/products' },
];