import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SecureComponent } from './secure/secure.component';
import { AuthGuard } from './_common/helpers/auth.guard';

import { UsersComponent } from './secure/users/users.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { SecureInnerPagesGuard } from './_common/helpers/secure-inner-pages.guard';
import { ConnectionResolver } from './_common/helpers/connection-resolver';
import { PreviewerComponent } from './secure/_common/previewer/previewer.component';
import { ChangePasswordComponent } from './auth/change-password/change-password.component';
import { RapportsComponent } from './secure/rapports/rapports.component';
import { IdentifierComponent } from './secure/identifier/identifier.component';
import { ZonesComponent } from './secure/zones/zones.component';
import { ProduitsComponent } from './secure/produits/produits.component';
import { StationsComponent } from './secure/stations/stations.component';
import { FournisseursComponent } from './secure/fournisseurs/fournisseurs.component';
import { ClientsComponent } from './secure/clients/clients.component';
import { BanquesComponent } from './secure/banques/banques.component';
import { CommandesComponent } from './secure/commandes/commandes.component';
import { RjvsComponent } from './secure/rjvs/rjvs.component';




const routes: Routes = [
  { path: '', component: LoginComponent},
  { path: 'sds-login', component: LoginComponent, canActivate: [SecureInnerPagesGuard]},
  { path: 'sds-forgot-password', component: ForgotPasswordComponent, canActivate: [SecureInnerPagesGuard] },
  { path: 'sds-change-password', component: ChangePasswordComponent, canActivate: [SecureInnerPagesGuard] },
  {
    path: 'sds-secure', component: SecureComponent, canActivate: [AuthGuard], resolve: { connection: ConnectionResolver }, children: [
      { path: '', component: IdentifierComponent, canActivate: [AuthGuard] },
      //{ path: 'previewer', component: PreviewerComponent, canActivate: [AuthGuard] },
      { path: 'identifier', component: IdentifierComponent, canActivate: [AuthGuard] },
      { path: 'rapports', component: RapportsComponent, canActivate: [AuthGuard] },
      { path: 'rjvs', component: RjvsComponent, canActivate: [AuthGuard], data: { roles: ['rjvs_manage'] } },
      { path: 'commandes', component: CommandesComponent, canActivate: [AuthGuard], data: { roles: ['commandes_manage'] } },
      { path: 'produits', component: ProduitsComponent, canActivate: [AuthGuard], data: { roles: ['produits_manage'] } },
      { path: 'clients', component: ClientsComponent, canActivate: [AuthGuard], data: { roles: ['clients_manage'] } },
      { path: 'fournisseurs', component: FournisseursComponent, canActivate: [AuthGuard], data: { roles: ['fournisseurs_manage'] } },
      { path: 'banques', component: BanquesComponent, canActivate: [AuthGuard], data: { roles: ['banques_manage'] } },
      { path: 'stations', component: StationsComponent, canActivate: [AuthGuard], data: { roles: ['stations_manage'] } },
      { path: 'zones', component: ZonesComponent, canActivate: [AuthGuard], data: { roles: ['zones_manage'] } },
      { path: 'users', component: UsersComponent, canActivate: [AuthGuard], data: { roles: ['comptes_manage'] } },
      // { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
    ]
  },
  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
