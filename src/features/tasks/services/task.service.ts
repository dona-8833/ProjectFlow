import { createClient } from "@/lib/supabase/client";
import type {
  Task,
  TaskAssignee,
  TaskInsert,
  TaskUpdate,
} from "../types/task.types";

const supabase = createClient();

export async function getTasks(projectId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Task[];
}

export async function getTask(taskId: string): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (error) throw new Error(error.message);
  return data as Task;
}

export async function createTask(task: TaskInsert): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .insert(task)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as Task;
}

export async function createTasks(tasks: TaskInsert[]): Promise<Task[]> {
  if (tasks.length === 0) return [];

  const { data, error } = await supabase
    .from("tasks")
    .insert(tasks)
    .select("*");

  if (error) throw new Error(error.message);
  return (data ?? []) as Task[];
}

export async function updateTask(
  taskId: string,
  projectId: string,
  updates: TaskUpdate,
): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", taskId)
    .eq("project_id", projectId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as Task;
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) throw new Error(error.message);
}

export async function completeTask(taskId: string): Promise<void> {
  const { error } = await supabase.rpc("complete_task", {
    task_id: taskId,
  });

  if (error?.code === "PGRST202" || error?.code === "42883") {
    throw new Error(
      "Task completion is not enabled in the database. Apply the task_permissions migration in Supabase, then retry.",
    );
  }

  if (error) throw new Error(error.message);
}

export async function getTaskAssignees(
  projectId: string,
): Promise<TaskAssignee[]> {
  const { data: collaboratorRows, error: collaboratorError } = await supabase
    .from("project_collaborators")
    .select("user_id")
    .eq("project_id", projectId);

  if (collaboratorError) throw new Error(collaboratorError.message);

  const userIds = [
    ...new Set((collaboratorRows ?? []).map((row) => row.user_id)),
  ];
  if (userIds.length === 0) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, name, avatar_url")
    .in("id", userIds)
    .order("username");

  if (error) throw new Error(error.message);
  return (data ?? []) as TaskAssignee[];
}
