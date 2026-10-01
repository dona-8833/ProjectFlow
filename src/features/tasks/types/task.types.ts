export type TaskStatus = "todo" | "in_progress" | "done" | "canceled";

export type TaskPriority = "low" | "medium" | "high";

export type TaskSource = "ai" | "manual";

export type Task = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to: string | null;
  created_by: string;
  source: TaskSource;
  created_at: string;
  updated_at: string;
};

export type TaskInsert = Omit<Task, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type TaskUpdate = Partial<
  Pick<Task, "title" | "description" | "status" | "priority" | "assigned_to">
>;

export type TaskAssignee = {
  id: string;
  username: string;
  name: string | null;
  avatar_url: string | null;
};

export type TaskFormValues = {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assigned_to: string | null;
};
