import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  completeTask,
  createTask,
  createTasks,
  deleteTask,
  getTask,
  getTaskAssignees,
  getTasks,
  updateTask,
} from "../services/task.service";
import type { TaskInsert, TaskUpdate } from "../types/task.types";

export const taskQueryKeys = {
  all: ["tasks"] as const,
  project: (projectId: string) => ["tasks", projectId] as const,
  task: (taskId: string) => ["task", taskId] as const,
  assignees: (projectId: string) => ["task-assignees", projectId] as const,
};

export function useTasks(projectId?: string) {
  return useQuery({
    queryKey: projectId ? taskQueryKeys.project(projectId) : taskQueryKeys.all,
    queryFn: () => getTasks(projectId as string),
    enabled: Boolean(projectId),
  });
}

export function useTasksForProjects(projectIds: string[]) {
  return useQueries({
    queries: projectIds.map((projectId) => ({
      queryKey: taskQueryKeys.project(projectId),
      queryFn: () => getTasks(projectId),
      enabled: Boolean(projectId),
    })),
  });
}

export function useTask(taskId?: string) {
  return useQuery({
    queryKey: taskQueryKeys.task(taskId ?? ""),
    queryFn: () => getTask(taskId as string),
    enabled: Boolean(taskId),
  });
}

export function useTaskAssignees(projectId?: string) {
  return useQuery({
    queryKey: taskQueryKeys.assignees(projectId ?? ""),
    queryFn: () => getTaskAssignees(projectId as string),
    enabled: Boolean(projectId),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: (task) => {
      void queryClient.invalidateQueries({
        queryKey: taskQueryKeys.project(task.project_id),
      });
    },
  });
}

export function useCreateTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tasks }: { projectId: string; tasks: TaskInsert[] }) =>
      createTasks(tasks),
    onSuccess: (_tasks, variables) => {
      void queryClient.invalidateQueries({
        queryKey: taskQueryKeys.project(variables.projectId),
      });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      taskId: string;
      projectId: string;
      updates: TaskUpdate;
    }) => updateTask(variables.taskId, variables.projectId, variables.updates),
    onSuccess: (task) => {
      queryClient.setQueryData(taskQueryKeys.task(task.id), task);
      void queryClient.invalidateQueries({
        queryKey: taskQueryKeys.project(task.project_id),
      });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId }: { taskId: string; projectId: string }) =>
      deleteTask(taskId),
    onSuccess: (_result, variables) => {
      queryClient.removeQueries({
        queryKey: taskQueryKeys.task(variables.taskId),
      });
      void queryClient.invalidateQueries({
        queryKey: taskQueryKeys.project(variables.projectId),
      });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId }: { taskId: string; projectId: string }) =>
      completeTask(taskId),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({
        queryKey: taskQueryKeys.project(variables.projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: taskQueryKeys.task(variables.taskId),
      });
    },
  });
}
