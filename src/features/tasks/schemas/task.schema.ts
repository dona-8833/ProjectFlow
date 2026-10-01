import { z } from "zod";

export const taskStatusSchema = z.enum([
  "todo",
  "in_progress",
  "done",
  "canceled",
]);
export const taskPrioritySchema = z.enum(["low", "medium", "high"]);

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, "Enter a task title").max(160),
  description: z.string().trim().max(5000),
  priority: taskPrioritySchema,
  status: taskStatusSchema,
  assigned_to: z.string().uuid().nullable(),
});

export const generatedTaskSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(5000),
  priority: taskPrioritySchema,
  status: z.literal("todo").default("todo"),
});

export const generatedTasksSchema = z.object({
  tasks: z.array(generatedTaskSchema).min(1).max(50),
});

export type TaskFormData = z.infer<typeof taskFormSchema>;
export type GeneratedTaskData = z.infer<typeof generatedTaskSchema>;
export type GeneratedTasksData = z.infer<typeof generatedTasksSchema>;
