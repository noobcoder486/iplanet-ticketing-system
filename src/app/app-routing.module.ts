import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Page500Component } from './authentication/page500/page500.component';


import { AuthLayoutComponent } from './layout/app-layout/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layout/app-layout/main-layout/main-layout.component';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: '/authentication/signin', pathMatch: 'full' },
      { path: 'authentication/nopermission', component: Page500Component, pathMatch: 'full' },
      {
        path: 'company',
        loadChildren: () =>
          import('./dashboard/dashboard.module').then((m) => m.DashboardModule)
      },
      {
        path: 'extra-pages',
        loadChildren: () =>
          import('./extra-pages/extra-pages.module').then(
            (m) => m.ExtraPagesModule
          )
      },

      {
        path: 'inventory',
        loadChildren: () =>
          import('./inventory/inventory.module').then(
            (m) => m.InventoryModule
          )
      },
      {
        path: 'transaction',
        loadChildren: () =>
          import('./transaction/transaction.module').then(
            (m) => m.TransactionModule
          )
      },
      
    ]
  },
  {
    path: 'authentication',
    component: AuthLayoutComponent,
    loadChildren: () => import('./authentication/authentication.module').then((m) => m.AuthenticationModule)
  },
  {
    path: 'auth/:companycode',
    component: MainLayoutComponent,
    loadChildren: () => import('./custom-components/custom-components.module').then((m) => m.CustomComponentModule)
  },
  {
    path: 'auth/:companycode',
    component: MainLayoutComponent,
    loadChildren: () => import('./inventory/inventory.module').then((m) => m.InventoryModule)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
