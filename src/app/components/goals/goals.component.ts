import { Component, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { DatePipe } from '@angular/common';
import { GoalService } from '../../services/goal.service';
import { Goal } from '../../models/goal.model';
import { GoalDialogComponent } from '../goal-dialog/goal-dialog.component';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule,
    DatePipe,
  ],
  templateUrl: './goals.component.html',
  styleUrl: './goals.component.scss',
})
export class GoalsComponent implements OnInit {
  goals = signal<Goal[]>([]);
  loading = signal(false);

  constructor(
    private goalService: GoalService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadGoals();
  }

  loadGoals(): void {
    this.loading.set(true);
    this.goalService.getGoals().subscribe({
      next: (goals) => {
        this.goals.set(goals);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('Failed to load goals. Is the backend running?', 'Close', { duration: 4000 });
        this.loading.set(false);
      },
    });
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(GoalDialogComponent, { data: {} });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.goalService.createGoal(result).subscribe({
          next: (goal) => {
            this.goals.update((g) => [goal, ...g]);
            this.snackBar.open('Goal created', 'Close', { duration: 2000 });
          },
          error: () => this.snackBar.open('Failed to create goal', 'Close', { duration: 3000 }),
        });
      }
    });
  }

  openEditDialog(goal: Goal): void {
    const ref = this.dialog.open(GoalDialogComponent, { data: { goal } });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.goalService.updateGoal(goal.id, result).subscribe({
          next: (updated) => {
            this.goals.update((g) => g.map((x) => (x.id === updated.id ? updated : x)));
            this.snackBar.open('Goal updated', 'Close', { duration: 2000 });
          },
          error: () => this.snackBar.open('Failed to update goal', 'Close', { duration: 3000 }),
        });
      }
    });
  }

  toggleComplete(goal: Goal): void {
    this.goalService.updateGoal(goal.id, { completed: !goal.completed }).subscribe({
      next: (updated) => {
        this.goals.update((g) => g.map((x) => (x.id === updated.id ? updated : x)));
      },
      error: () => this.snackBar.open('Failed to update goal', 'Close', { duration: 3000 }),
    });
  }

  deleteGoal(goal: Goal): void {
    this.goalService.deleteGoal(goal.id).subscribe({
      next: () => {
        this.goals.update((g) => g.filter((x) => x.id !== goal.id));
        this.snackBar.open('Goal deleted', 'Close', { duration: 2000 });
      },
      error: () => this.snackBar.open('Failed to delete goal', 'Close', { duration: 3000 }),
    });
  }

  get completedCount(): number {
    return this.goals().filter((g) => g.completed).length;
  }

  get pendingCount(): number {
    return this.goals().filter((g) => !g.completed).length;
  }

  get overdueCount(): number {
    const today = new Date().toISOString().split('T')[0];
    return this.goals().filter((g) => !g.completed && g.due_date && g.due_date < today).length;
  }

  isOverdue(goal: Goal): boolean {
    if (goal.completed || !goal.due_date) return false;
    return goal.due_date < new Date().toISOString().split('T')[0];
  }
}
