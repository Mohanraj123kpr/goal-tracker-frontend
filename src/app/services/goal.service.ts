import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Goal, GoalCreate, GoalUpdate } from '../models/goal.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GoalService {
  private readonly apiUrl = `${environment.apiUrl}/goals`;

  constructor(private http: HttpClient) {}

  getGoals(): Observable<Goal[]> {
    return this.http.get<Goal[]>(this.apiUrl);
  }

  createGoal(goal: GoalCreate): Observable<Goal> {
    return this.http.post<Goal>(this.apiUrl, goal);
  }

  updateGoal(id: number, goal: GoalUpdate): Observable<Goal> {
    return this.http.put<Goal>(`${this.apiUrl}/${id}`, goal);
  }

  deleteGoal(id: number): Observable<Goal> {
    return this.http.delete<Goal>(`${this.apiUrl}/${id}`);
  }
}
