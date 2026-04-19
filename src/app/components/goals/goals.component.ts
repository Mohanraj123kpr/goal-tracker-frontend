import { Component, OnInit, signal, computed } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { GoalService } from '../../services/goal.service';
import { AuthService } from '../../services/auth.service';
import { Goal } from '../../models/goal.model';
import { GoalDialogComponent } from '../goal-dialog/goal-dialog.component';

type FilterTab = 'all' | 'pending' | 'completed' | 'overdue';
const PAGE_SIZE = 6;

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    DatePipe,
    TitleCasePipe,
  ],
  templateUrl: './goals.component.html',
  styleUrl: './goals.component.scss',
})
export class GoalsComponent implements OnInit {
  goals = signal<Goal[]>([]);
  loading = signal(false);
  currentPage = signal(0);
  activeFilter = signal<FilterTab>('all');
  searchQuery = signal('');
  readonly pageSize = PAGE_SIZE;

  filteredGoals = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const today = new Date().toISOString().split('T')[0];
    return this.goals().filter((g) => {
      const matchesSearch = !q || g.title.toLowerCase().includes(q) || (g.description ?? '').toLowerCase().includes(q);
      if (!matchesSearch) return false;
      switch (this.activeFilter()) {
        case 'pending':   return !g.completed;
        case 'completed': return g.completed;
        case 'overdue':   return !g.completed && !!g.due_date && g.due_date < today;
        default:          return true;
      }
    });
  });

  pagedGoals = computed(() =>
    this.filteredGoals().slice(this.currentPage() * PAGE_SIZE, (this.currentPage() + 1) * PAGE_SIZE)
  );

  totalPages = computed(() => Math.ceil(this.filteredGoals().length / PAGE_SIZE));

  pageRange = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i));

  constructor(
    private goalService: GoalService,
    public auth: AuthService,
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

  goToPage(page: number): void {
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  setFilter(f: FilterTab): void {
    this.activeFilter.set(f);
    this.currentPage.set(0);
  }

  onSearch(): void {
    this.currentPage.set(0);
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(GoalDialogComponent, {
      data: {},
      width: '100%',
      maxWidth: '480px',
      maxHeight: '90vh',
    });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.goalService.createGoal(result).subscribe({
          next: (goal) => {
            this.goals.update((g) => [goal, ...g]);
            this.currentPage.set(0);
            this.snackBar.open('Goal created', 'Close', { duration: 2000 });
          },
          error: () => this.snackBar.open('Failed to create goal', 'Close', { duration: 3000 }),
        });
      }
    });
  }

  openEditDialog(goal: Goal): void {
    const ref = this.dialog.open(GoalDialogComponent, {
      data: { goal },
      width: '100%',
      maxWidth: '480px',
      maxHeight: '90vh',
    });
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
        // go back a page if current page is now empty
        if (this.currentPage() >= this.totalPages() && this.currentPage() > 0) {
          this.currentPage.update(p => p - 1);
        }
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
