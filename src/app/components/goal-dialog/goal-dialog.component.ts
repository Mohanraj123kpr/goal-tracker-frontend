import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Goal } from '../../models/goal.model';

export interface DialogData {
  goal?: Goal;
}

@Component({
  selector: 'app-goal-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
  ],
  template: `
    <div class="dialog-header">
      <div class="dialog-header-icon">
        <mat-icon>{{ data.goal ? 'edit' : 'add_task' }}</mat-icon>
      </div>
      <div>
        <h2 class="dialog-title">{{ data.goal ? 'Edit Goal' : 'New Goal' }}</h2>
        <p class="dialog-sub">{{ data.goal ? 'Update your goal details' : 'Set a new goal to work towards' }}</p>
      </div>
    </div>

    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Title</mat-label>
          <mat-icon matPrefix>flag</mat-icon>
          <input matInput formControlName="title" placeholder="What do you want to achieve?" />
          @if (form.get('title')?.hasError('required')) {
            <mat-error>Title is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <mat-icon matPrefix>notes</mat-icon>
          <textarea matInput formControlName="description" rows="2" placeholder="A short description (optional)"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Due Date</mat-label>
          <mat-icon matPrefix>event</mat-icon>
          <input matInput [matDatepicker]="picker" formControlName="due_date" placeholder="Pick a due date" />
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Plan / Steps</mat-label>
          <mat-icon matPrefix>list_alt</mat-icon>
          <textarea matInput formControlName="plan" rows="4" placeholder="Break it down — what steps will you take?"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-button class="cancel-btn" (click)="dialogRef.close()">Cancel</button>
      <button mat-flat-button class="save-btn" [disabled]="form.invalid" (click)="submit()">
        <mat-icon>{{ data.goal ? 'save' : 'add_task' }}</mat-icon>
        {{ data.goal ? 'Save Changes' : 'Create Goal' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 20px 24px 12px;
      background: linear-gradient(135deg, #6c3fc5, #9c5de8);
      border-radius: 4px 4px 0 0;
    }
    .dialog-header-icon {
      width: 44px; height: 44px;
      background: rgba(255,255,255,0.2);
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      mat-icon { color: #fff; font-size: 22px; }
    }
    .dialog-title { margin: 0; font-size: 1.1rem; font-weight: 700; color: #fff; }
    .dialog-sub   { margin: 2px 0 0; font-size: 0.8rem; color: rgba(255,255,255,0.75); }

    .dialog-form {
      display: flex; flex-direction: column; gap: 4px;
      width: min(440px, 90vw);
      padding-top: 12px;
    }
    .full-width { width: 100%; }

    .dialog-actions { padding: 8px 16px 16px; gap: 8px; }
    .cancel-btn { color: #666; }
    .save-btn {
      background: linear-gradient(135deg, #6c3fc5, #9c5de8) !important;
      color: #fff !important;
      border-radius: 10px !important;
      font-weight: 600;
      gap: 4px;
    }
  `],
})
export class GoalDialogComponent {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<GoalDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    fb: FormBuilder
  ) {
    this.form = fb.group({
      title: [data.goal?.title ?? '', Validators.required],
      description: [data.goal?.description ?? ''],
      due_date: [data.goal?.due_date ? new Date(data.goal.due_date) : null],
      plan: [data.goal?.plan ?? ''],
    });
  }

  submit(): void {
    if (this.form.valid) {
      const value = this.form.value;
      const due_date = value.due_date
        ? (value.due_date as Date).toISOString().split('T')[0]
        : null;
      this.dialogRef.close({ ...value, due_date });
    }
  }
}
