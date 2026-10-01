import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, UserRound } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { taskFormSchema, type TaskFormData } from "../schemas/task.schema";
import { useCreateTask, useUpdateTask } from "../hooks/useTasks";
import type { Task, TaskAssignee, TaskInsert } from "../types/task.types";

type TaskFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  userId: string;
  task?: Task | null;
  assignees: TaskAssignee[];
  assigneesLoading?: boolean;
  onSuccess: (message: string) => void;
};

export function TaskFormDialog({
  open,
  onOpenChange,
  projectId,
  userId,
  task,
  assignees,
  assigneesLoading = false,
  onSuccess,
}: TaskFormDialogProps) {
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const [assigneeMenuOpen, setAssigneeMenuOpen] = useState(false);
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "todo",
      assigned_to: null,
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      title: task?.title ?? "",
      description: task?.description ?? "",
      priority: task?.priority ?? "medium",
      status: task?.status ?? "todo",
      assigned_to: task?.assigned_to ?? null,
    });
  }, [form, open, task]);

  const onSubmit = async (values: TaskFormData) => {
    try {
      const updates = { ...values, description: values.description || null };
      if (task) {
        await updateMutation.mutateAsync({
          taskId: task.id,
          projectId,
          updates,
        });
        onSuccess("Task updated.");
      } else {
        const insert: TaskInsert = {
          ...updates,
          project_id: projectId,
          created_by: userId,
          source: "manual",
        };
        await createMutation.mutateAsync(insert);
        onSuccess("Task created.");
      }
      onOpenChange(false);
    } catch (error) {
      form.setError("root", {
        type: "server",
        message:
          error instanceof Error ? error.message : "Unable to save task.",
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setAssigneeMenuOpen(false);
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "Add task"}</DialogTitle>
          <DialogDescription>
            {task
              ? "Update task details and ownership."
              : "Add a task to this project."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <label
              className="mb-1.5 block text-sm font-medium"
              htmlFor="task-title"
            >
              Title
            </label>
            <Input
              id="task-title"
              autoFocus
              maxLength={160}
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="mt-1 text-xs text-red-600">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label
              className="mb-1.5 block text-sm font-medium"
              htmlFor="task-description"
            >
              Description
            </label>
            <textarea
              id="task-description"
              rows={4}
              maxLength={5000}
              placeholder="Add acceptance criteria or implementation notes"
              className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="mt-1 text-xs text-red-600">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                className="mb-1.5 block text-sm font-medium"
                htmlFor="task-priority"
              >
                Priority
              </label>
              <select
                id="task-priority"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                {...form.register("priority")}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label
                className="mb-1.5 block text-sm font-medium"
                htmlFor="task-status"
              >
                Status
              </label>
              <select
                id="task-status"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                {...form.register("status")}
              >
                <option value="todo">To do</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-medium">Assignee</span>
            <Controller
              control={form.control}
              name="assigned_to"
              render={({ field }) => {
                const selected = assignees.find(
                  (person) => person.id === field.value,
                );
                return (
                  <div className="relative">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between font-normal"
                      aria-expanded={assigneeMenuOpen}
                      onClick={() => setAssigneeMenuOpen((current) => !current)}
                    >
                      <span className="flex min-w-0 items-center gap-2 truncate">
                        {selected ? (
                          <AssigneeAvatar person={selected} />
                        ) : (
                          <UserRound className="size-4" />
                        )}
                        {selected
                          ? `${selected.name || selected.username} (@${selected.username})`
                          : "Unassigned"}
                      </span>
                      <ChevronsUpDown className="size-3.5 text-muted-foreground" />
                    </Button>
                    {assigneeMenuOpen && (
                      <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-auto rounded-md border bg-popover p-1 shadow-md">
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm hover:bg-muted"
                          onClick={() => {
                            field.onChange(null);
                            setAssigneeMenuOpen(false);
                          }}
                        >
                          <UserRound className="size-4" /> Unassigned
                          {field.value === null && (
                            <Check className="ml-auto size-4" />
                          )}
                        </button>
                        {assignees.map((person) => (
                          <button
                            key={person.id}
                            type="button"
                            className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm hover:bg-muted"
                            onClick={() => {
                              field.onChange(person.id);
                              setAssigneeMenuOpen(false);
                            }}
                          >
                            <AssigneeAvatar person={person} />
                            <span className="min-w-0 flex-1 truncate">
                              {person.name || person.username}
                              <span className="ml-1 text-muted-foreground">
                                @{person.username}
                              </span>
                            </span>
                            {field.value === person.id && (
                              <Check className="size-4" />
                            )}
                          </button>
                        ))}
                        {assigneesLoading ? (
                          <p className="px-2 py-3 text-xs text-muted-foreground">
                            Loading collaborators...
                          </p>
                        ) : (
                          assignees.length === 0 && (
                            <p className="px-2 py-3 text-xs text-muted-foreground">
                              No collaborators to assign.
                            </p>
                          )
                        )}
                      </div>
                    )}
                  </div>
                );
              }}
            />
          </div>

          {form.formState.errors.root && (
            <p role="alert" className="text-sm text-red-600">
              {form.formState.errors.root.message}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : task ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AssigneeAvatar({ person }: { person: TaskAssignee }) {
  return person.avatar_url ? (
    <img
      className="size-6 shrink-0 rounded-full object-cover"
      src={person.avatar_url}
      alt=""
    />
  ) : (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
      {(person.name || person.username).slice(0, 1).toUpperCase()}
    </span>
  );
}
