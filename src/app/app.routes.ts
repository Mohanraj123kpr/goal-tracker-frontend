import { Routes } from '@angular/router';
import { GoalsComponent } from './components/goals/goals.component';
import { AuthComponent } from './components/auth/auth.component';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '', component: GoalsComponent, canActivate: [authGuard] },
  { path: 'login', component: AuthComponent },
  { path: '**', redirectTo: '' },
];
