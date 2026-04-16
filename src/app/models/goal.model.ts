export interface Goal {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
}

export interface GoalCreate {
  title: string;
  description?: string;
}

export interface GoalUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
}
