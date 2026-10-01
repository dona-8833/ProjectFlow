import { useState } from "react";
import { Check, Clock3, Eye, Pencil, Trash2, UserRound } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { useProfile } from "@/features/settings/hooks/userProfile";
import { AssigneeAvatar } from "./TaskFormDialog";
import type { Task, TaskAssignee } from "../types/task.types";

type TaskListProps = {
  tasks: Task[];
  isOwner: boolean;
  currentUserId: string;
  assignees: TaskAssignee[];
  completingTaskId?: string;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onComplete: (task: Task) => void;
};

const statusLabels = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
  canceled: "Canceled",
} as const;

const statusStyles = {
  todo: "border-[#d7d7d7] bg-[#f3f3f3] text-[#555555]",
  in_progress: "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]",
  done: "border-[#bbf7d0] bg-[#ecfdf3] text-[#027a48]",
  canceled: "border-[#fecaca] bg-[#fef2f2] text-[#b42318]",
} as const;

const priorityStyles = {
  low: "border-[#dce7dd] bg-[#f1f7f1] text-[#536f57]",
  medium: "border-[#e8e1d1] bg-[#faf6eb] text-[#806d3d]",
  high: "border-[#eedcda] bg-[#fbf1ef] text-[#9a534b]",
} as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function TaskList({
  tasks,
  isOwner,
  currentUserId,
  assignees,
  completingTaskId,
  onEdit,
  onDelete,
  onComplete,
}: TaskListProps) {
  const [detailTask, setDetailTask] = useState<Task | null>(null);

  return (
    <>
      <div className="space-y-2.5">
        {tasks.map((task) => {
          const assignee = assignees.find(
            (person) => person.id === task.assigned_to,
          );
          return (
            <article
              key={task.id}
              className="rounded-md border bg-card p-4 shadow-sm sm:p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="min-w-0 wrap-break-word text-sm font-semibold text-foreground">
                      {task.title}
                    </h2>
                    <span className="rounded border px-2 py-0.5 text-[10px] text-muted-foreground">
                      {task.source === "ai" ? "AI Generated" : "Manual"}
                    </span>
                  </div>
                  {task.description && (
                    <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-xs leading-5 text-muted-foreground">
                      {task.description}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px]">
                    <span
                      className={`rounded border px-2 py-1 ${statusStyles[task.status]}`}
                    >
                      {statusLabels[task.status]}
                    </span>
                    <span
                      className={`rounded border px-2 py-1 ${priorityStyles[task.priority]}`}
                    >
                      {task.priority} priority
                    </span>
                    {isOwner &&
                      (assignee ? (
                        <span className="inline-flex items-center gap-1.5 rounded border px-2 py-1 text-muted-foreground">
                          <AssigneeAvatar person={assignee} />@
                          {assignee.username}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded border px-2 py-1 text-muted-foreground">
                          <UserRound className="size-3" />
                          Unassigned
                        </span>
                      ))}
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Clock3 className="size-3" />
                      {formatDate(task.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDetailTask(task)}
                  >
                    <Eye /> View
                  </Button>
                  {isOwner ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(task)}
                        aria-label={`Edit ${task.title}`}
                      >
                        <Pencil /> Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(task)}
                        aria-label={`Delete ${task.title}`}
                      >
                        <Trash2 /> Delete
                      </Button>
                    </>
                  ) : task.assigned_to === currentUserId &&
                    task.status !== "done" &&
                    task.status !== "canceled" ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => onComplete(task)}
                      disabled={completingTaskId === task.id}
                    >
                      <Check />
                      {completingTaskId === task.id
                        ? "Completing..."
                        : "Mark as complete"}
                    </Button>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <TaskDetailsDialog
        task={detailTask}
        open={Boolean(detailTask)}
        onOpenChange={(open) => {
          if (!open) setDetailTask(null);
        }}
        isOwner={isOwner}
        currentUserId={currentUserId}
        completing={detailTask ? completingTaskId === detailTask.id : false}
        assignee={assignees.find(
          (person) => person.id === detailTask?.assigned_to,
        )}
        onEdit={(task) => {
          setDetailTask(null);
          onEdit(task);
        }}
        onDelete={(task) => {
          setDetailTask(null);
          onDelete(task);
        }}
        onComplete={(task) => {
          setDetailTask(null);
          onComplete(task);
        }}
      />
    </>
  );
}

function TaskDetailsDialog({
  task,
  open,
  onOpenChange,
  isOwner,
  currentUserId,
  completing,
  assignee,
  onEdit,
  onDelete,
  onComplete,
}: {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isOwner: boolean;
  currentUserId: string;
  completing: boolean;
  assignee?: TaskAssignee;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onComplete: (task: Task) => void;
}) {
  const { data: creator } = useProfile(isOwner ? task?.created_by : undefined);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        {task && (
          <>
            <DialogHeader>
              <div className="flex flex-wrap items-center gap-2 pr-7">
                <DialogTitle className="wrap-break-word">
                  {task.title}
                </DialogTitle>
                <span className="rounded border px-2 py-0.5 text-[10px] text-muted-foreground">
                  {task.source === "ai" ? "AI Generated" : "Manual"}
                </span>
              </div>
              <DialogDescription>Task details</DialogDescription>
            </DialogHeader>
            <dl className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
              <Detail
                label="Status"
                value={<StatusBadge status={task.status} />}
              />
              <Detail label="Priority" value={task.priority} />
              <Detail label="Created at" value={formatDate(task.created_at)} />
              {isOwner && (
                <Detail
                  label="Updated at"
                  value={formatDate(task.updated_at)}
                />
              )}
              {isOwner && (
                <Detail
                  label="Assignee"
                  value={
                    assignee ? (
                      <span className="inline-flex items-center gap-2">
                        <AssigneeAvatar person={assignee} />
                        {assignee.name || `@${assignee.username}`}
                      </span>
                    ) : (
                      "Unassigned"
                    )
                  }
                />
              )}
              {isOwner && (
                <Detail
                  label="Created by"
                  value={creator?.name || creator?.username || task.created_by}
                />
              )}
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium text-muted-foreground">
                  Description
                </dt>
                <dd className="mt-1 whitespace-pre-wrap wrap-break-word text-sm text-foreground">
                  {task.description || "No description provided."}
                </dd>
              </div>
            </dl>
            <DialogFooter>
              {isOwner ? (
                <>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => onDelete(task)}
                  >
                    <Trash2 />
                    Delete
                  </Button>
                  <Button type="button" onClick={() => onEdit(task)}>
                    <Pencil />
                    Edit
                  </Button>
                </>
              ) : task.assigned_to === currentUserId &&
                task.status !== "done" &&
                task.status !== "canceled" ? (
                <Button
                  type="button"
                  onClick={() => onComplete(task)}
                  disabled={completing}
                >
                  <Check />
                  {completing ? "Completing..." : "Mark as complete"}
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: Task["status"] }) {
  return (
    <span
      className={`inline-flex rounded border px-2 py-1 text-xs ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
