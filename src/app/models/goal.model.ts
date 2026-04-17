export interface Goal {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
  due_date: string | null;
  plan: string | null;
}

export interface GoalCreate {
  title: string;
  description?: string;
  due_date?: string | null;
  plan?: string | null;
}

export interface GoalUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
  due_date?: string | null;
  plan?: string | null;
}
