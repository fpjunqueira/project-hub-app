import { Routes } from '@angular/router';

import { AddressesFormComponent } from './components/addresses/form/addresses-form.component';
import { AddressesListComponent } from './components/addresses/list/addresses-list.component';
import { AddressesViewComponent } from './components/addresses/view/addresses-view.component';
import { FilesFormComponent } from './components/files/form/files-form.component';
import { FilesListComponent } from './components/files/list/files-list.component';
import { FilesViewComponent } from './components/files/view/files-view.component';
import { LoginComponent } from './components/login/login.component';
import { OwnersFormComponent } from './components/owners/form/owners-form.component';
import { OwnersListComponent } from './components/owners/list/owners-list.component';
import { OwnersViewComponent } from './components/owners/view/owners-view.component';
import { ProjectsFormComponent } from './components/projects/form/projects-form.component';
import { ProjectsListComponent } from './components/projects/list/projects-list.component';
import { ProjectsViewComponent } from './components/projects/view/projects-view.component';
import { TelecomFormComponent } from './components/telecom/form/telecom-form.component';
import { TelecomListComponent } from './components/telecom/list/telecom-list.component';
import { TelecomViewComponent } from './components/telecom/view/telecom-view.component';
import { authGuard, loginGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  { path: 'projects/new', component: ProjectsFormComponent, canActivate: [authGuard] },
  { path: 'projects/:id/edit', component: ProjectsFormComponent, canActivate: [authGuard] },
  { path: 'projects/:id/view', component: ProjectsViewComponent, canActivate: [authGuard] },
  { path: 'projects', component: ProjectsListComponent, canActivate: [authGuard] },
  { path: 'owners/new', component: OwnersFormComponent, canActivate: [authGuard] },
  { path: 'owners/:id/edit', component: OwnersFormComponent, canActivate: [authGuard] },
  { path: 'owners/:id/view', component: OwnersViewComponent, canActivate: [authGuard] },
  { path: 'owners', component: OwnersListComponent, canActivate: [authGuard] },
  { path: 'addresses/new', component: AddressesFormComponent, canActivate: [authGuard] },
  { path: 'addresses/:id/edit', component: AddressesFormComponent, canActivate: [authGuard] },
  { path: 'addresses/:id/view', component: AddressesViewComponent, canActivate: [authGuard] },
  { path: 'addresses', component: AddressesListComponent, canActivate: [authGuard] },
  { path: 'files/new', component: FilesFormComponent, canActivate: [authGuard] },
  { path: 'files/:id/edit', component: FilesFormComponent, canActivate: [authGuard] },
  { path: 'files/:id/view', component: FilesViewComponent, canActivate: [authGuard] },
  { path: 'files', component: FilesListComponent, canActivate: [authGuard] },
  { path: 'documentacoes/new', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'documentacoes' } },
  { path: 'documentacoes/:id/edit', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'documentacoes' } },
  { path: 'documentacoes/:id/view', component: TelecomViewComponent, canActivate: [authGuard], data: { screenKey: 'documentacoes' } },
  { path: 'documentacoes', component: TelecomListComponent, canActivate: [authGuard], data: { screenKey: 'documentacoes' } },
  { path: 'faturamentos/new', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'faturamentos' } },
  { path: 'faturamentos/:id/edit', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'faturamentos' } },
  { path: 'faturamentos/:id/view', component: TelecomViewComponent, canActivate: [authGuard], data: { screenKey: 'faturamentos' } },
  { path: 'faturamentos', component: TelecomListComponent, canActivate: [authGuard], data: { screenKey: 'faturamentos' } },
  { path: 'informacoes-cadastro-veiculos/new', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'informacoesCadastroVeiculos' } },
  { path: 'informacoes-cadastro-veiculos/:id/edit', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'informacoesCadastroVeiculos' } },
  { path: 'informacoes-cadastro-veiculos/:id/view', component: TelecomViewComponent, canActivate: [authGuard], data: { screenKey: 'informacoesCadastroVeiculos' } },
  { path: 'informacoes-cadastro-veiculos', component: TelecomListComponent, canActivate: [authGuard], data: { screenKey: 'informacoesCadastroVeiculos' } },
  { path: 'cadastro-usuarios/new', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'cadastroUsuarios' } },
  { path: 'cadastro-usuarios/:id/edit', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'cadastroUsuarios' } },
  { path: 'cadastro-usuarios/:id/view', component: TelecomViewComponent, canActivate: [authGuard], data: { screenKey: 'cadastroUsuarios' } },
  { path: 'cadastro-usuarios', component: TelecomListComponent, canActivate: [authGuard], data: { screenKey: 'cadastroUsuarios' } },
  { path: 'site-claro/new', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'siteClaro' } },
  { path: 'site-claro/:id/edit', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'siteClaro' } },
  { path: 'site-claro/:id/view', component: TelecomViewComponent, canActivate: [authGuard], data: { screenKey: 'siteClaro' } },
  { path: 'site-claro', component: TelecomListComponent, canActivate: [authGuard], data: { screenKey: 'siteClaro' } },
  { path: 'site-tim/new', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'siteTim' } },
  { path: 'site-tim/:id/edit', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'siteTim' } },
  { path: 'site-tim/:id/view', component: TelecomViewComponent, canActivate: [authGuard], data: { screenKey: 'siteTim' } },
  { path: 'site-tim', component: TelecomListComponent, canActivate: [authGuard], data: { screenKey: 'siteTim' } },
  { path: 'site-vivo/new', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'siteVivo' } },
  { path: 'site-vivo/:id/edit', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'siteVivo' } },
  { path: 'site-vivo/:id/view', component: TelecomViewComponent, canActivate: [authGuard], data: { screenKey: 'siteVivo' } },
  { path: 'site-vivo', component: TelecomListComponent, canActivate: [authGuard], data: { screenKey: 'siteVivo' } },
  { path: 'cadastro-contratos/new', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'cadastroContratos' } },
  { path: 'cadastro-contratos/:id/edit', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'cadastroContratos' } },
  { path: 'cadastro-contratos/:id/view', component: TelecomViewComponent, canActivate: [authGuard], data: { screenKey: 'cadastroContratos' } },
  { path: 'cadastro-contratos', component: TelecomListComponent, canActivate: [authGuard], data: { screenKey: 'cadastroContratos' } },
  { path: 'chamados/new', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'chamados' } },
  { path: 'chamados/:id/edit', component: TelecomFormComponent, canActivate: [authGuard], data: { screenKey: 'chamados' } },
  { path: 'chamados/:id/view', component: TelecomViewComponent, canActivate: [authGuard], data: { screenKey: 'chamados' } },
  { path: 'chamados', component: TelecomListComponent, canActivate: [authGuard], data: { screenKey: 'chamados' } }
];
