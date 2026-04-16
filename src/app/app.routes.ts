import { Routes } from '@angular/router';
import { GoalsComponent } from './components/goals/goals.component';

export const routes: Routes = [
  { path: '', component: GoalsComponent },
  { path: '**', redirectTo: '' },
];
