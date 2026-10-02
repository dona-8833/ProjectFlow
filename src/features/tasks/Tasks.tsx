import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowDownWideNarrow,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { useAuthStore } from "@/app/store/authStore";
import { useProject } from "@/features/projects/hooks/useProjects";
import { TaskFormDialog } from "./components/TaskFormDialog";
import { TaskList } from "./components/TaskList";
import {
  useCompleteTask,
  useCreateTasks,
  useDeleteTask,
  useTaskAssignees,
  useTasks,
  useUpdateTask,
} from "./hooks/useTasks";
import { generateTasks } from "./services/Ai";
import type {
  Task,
  TaskInsert,
  TaskPriority,
  TaskStatus,
} from "./types/task.types";

type Notice = { kind: "success" | "error"; message: string };
type SortKey = "newest" | "oldest" | "title" | "priority" | "status";

const statusLabels: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
  canceled: "Canceled",
};

const priorityRank: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};
const statusRank: Record<TaskStatus, number> = {
  in_progress: 0,
  todo: 1,
  done: 2,
  canceled: 3,
};

const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({
  value,
  label,
}));

const priorityOptions = [
  { value: "all", label: "All priorities" },
  { value: "high", label: "High priority" },
  { value: "medium", label: "Medium priority" },
  { value: "low", label: "Low priority" },
];

export default function Tasks() {
  const user = useAuthStore((state) => state.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    data: projectGroups,
    isLoading: projectsLoading,
    isError: projectsError,
  } = useProject(user?.id);
  const projects = useMemo(
    () => [...(projectGroups?.owned ?? []), ...(projectGroups?.invited ?? [])],
    [projectGroups],
  );
  const projectId = searchParams.get("project") ?? "";
  const selectedProject = projects.find((project) => project.id === projectId);
  const isOwner = Boolean(
    selectedProject && user?.id && selectedProject.owner_id === user.id,
  );
  const {
    data: tasks = [],
    isLoading: tasksLoading,
    isError: tasksError,
    error: taskQueryError,
  } = useTasks(selectedProject?.id);
  const { data: assignees = [], isLoading: assigneesLoading } =
    useTaskAssignees(isOwner ? selectedProject?.id : undefined);
  const createTasksMutation = useCreateTasks();
  const deleteTaskMutation = useDeleteTask();
  const completeTaskMutation = useCompleteTask();
  const updateTaskMutation = useUpdateTask();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Task | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    if (!projectsLoading && !projectId && projects.length > 0) {
      setSearchParams({ project: projects[0].id }, { replace: true });
    }
  }, [projectId, projects, projectsLoading, setSearchParams]);

  const visibleTasks = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return tasks
      .filter((task) => {
        const matchesSearch =
          !normalizedSearch ||
          task.title.toLocaleLowerCase().includes(normalizedSearch) ||
          (task.description ?? "")
            .toLocaleLowerCase()
            .includes(normalizedSearch);
        return (
          matchesSearch &&
          (statusFilter === "all" || task.status === statusFilter) &&
          (priorityFilter === "all" || task.priority === priorityFilter) &&
          (!isOwner ||
            assigneeFilter === "all" ||
            (assigneeFilter === "unassigned"
              ? task.assigned_to === null
              : task.assigned_to === assigneeFilter)) &&
          (!isOwner || sourceFilter === "all" || task.source === sourceFilter)
        );
      })
      .sort((left, right) => {
        if (sort === "oldest")
          return left.created_at.localeCompare(right.created_at);
        if (sort === "title") return left.title.localeCompare(right.title);
        if (sort === "priority")
          return priorityRank[left.priority] - priorityRank[right.priority];
        if (sort === "status")
          return statusRank[left.status] - statusRank[right.status];
        return right.created_at.localeCompare(left.created_at);
      });
  }, [
    tasks,
    search,
    statusFilter,
    priorityFilter,
    assigneeFilter,
    sourceFilter,
    sort,
    isOwner,
  ]);

  const selectProject = (nextProjectId: string) => {
    setSearchParams(nextProjectId ? { project: nextProjectId } : {});
    setSearch("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setAssigneeFilter("all");
    setSourceFilter("all");
    setNotice(null);
  };

  const openCreateForm = () => {
    setEditingTask(null);
    setFormOpen(true);
  };

  const openEditForm = (task: Task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteCandidate || !selectedProject) return;
    try {
      await deleteTaskMutation.mutateAsync({
        taskId: deleteCandidate.id,
        projectId: selectedProject.id,
      });
      setNotice({ kind: "success", message: "Task deleted." });
      setDeleteCandidate(null);
    } catch (error) {
      setNotice({
        kind: "error",
        message:
          error instanceof Error ? error.message : "Unable to delete task.",
      });
    }
  };

  const handleComplete = async (task: Task) => {
    if (!selectedProject) return;
    try {
      await completeTaskMutation.mutateAsync({
        taskId: task.id,
        projectId: selectedProject.id,
      });
      setNotice({ kind: "success", message: "Task marked complete." });
    } catch (error) {
      setNotice({
        kind: "error",
        message:
          error instanceof Error ? error.message : "Unable to complete task.",
      });
    }
  };

  const handleStatusChange = async (task: Task, status: TaskStatus) => {
    if (!selectedProject || task.status === status) return;
    try {
      await updateTaskMutation.mutateAsync({
        taskId: task.id,
        projectId: selectedProject.id,
        updates: { status },
      });
      setNotice({
        kind: "success",
        message: `Task marked ${statusLabels[status].toLowerCase()}.`,
      });
    } catch (error) {
      setNotice({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to update task status.",
      });
    }
  };

  const handleGenerate = async () => {
    if (!selectedProject || !user?.id) return;
    setIsGenerating(true);
    setNotice(null);
    try {
      const result = await generateTasks({
        projectId: selectedProject.id,
        title: selectedProject.title,
        description: selectedProject.description ?? "",
        ownerId: selectedProject.owner_id ?? user.id,
        collaborators: assignees.map((person) => person.id),
      });
      const normalizedTasks: TaskInsert[] = result.tasks.map((task, index) => ({
        project_id: selectedProject.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: "todo",
        assigned_to: assignees.length
          ? assignees[index % assignees.length].id
          : null,
        created_by: user.id,
        source: "ai",
      }));
      await createTasksMutation.mutateAsync({
        projectId: selectedProject.id,
        tasks: normalizedTasks,
      });
      setNotice({
        kind: "success",
        message: `${normalizedTasks.length} AI-generated tasks added.`,
      });
    } catch (error) {
      setNotice({
        kind: "error",
        message:
          error instanceof Error ? error.message : "Unable to generate tasks.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user) return null;

  return (
    <main className="mx-auto w-full max-w-6xl space-y-5 pb-8">
      <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Workspace
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {selectedProject && !isOwner ? "My Tasks" : "Tasks"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {selectedProject
              ? selectedProject.title
              : "Choose a project to view its tasks."}
          </p>
        </div>
        {projects.length > 0 && (
          <Select
            ariaLabel="Select project"
            value={selectedProject?.id ?? ""}
            onValueChange={selectProject}
            placeholder="Select project"
            className="w-full sm:max-w-xs"
            triggerClassName="w-full"
            options={projects.map((project) => ({
              value: project.id,
              label: `${project.title}${project.owner_id === user.id ? " · Owner" : " · Collaborator"}`,
            }))}
          />
        )}
      </header>

      {notice && (
        <div
          role={notice.kind === "error" ? "alert" : "status"}
          className={`flex items-start justify-between gap-3 rounded-md border px-3 py-2.5 text-sm ${notice.kind === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}
        >
          <span>{notice.message}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            className="text-current/70 hover:text-current"
            onClick={() => setNotice(null)}
          >
            ×
          </button>
        </div>
      )}

      {projectsLoading ? (
        <div className="space-y-3">
          <div className="h-9 animate-pulse rounded bg-muted" />
          <div className="h-28 animate-pulse rounded bg-muted" />
        </div>
      ) : projectsError ? (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          Unable to load your projects. Refresh and try again.
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center">
          <h2 className="font-medium">No projects yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create or join a project before managing tasks.
          </p>
        </div>
      ) : !selectedProject ? (
        <div className="rounded-md border border-dashed p-8 text-center">
          <h2 className="font-medium">Choose a project</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Select one of your owned or invited projects to continue.
          </p>
        </div>
      ) : (
        <>
          <section aria-label="Task controls" className="space-y-3">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
              <label className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search title or description"
                  className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <Select
                  ariaLabel="Sort tasks"
                  value={sort}
                  onValueChange={(value) => setSort(value as SortKey)}
                  triggerClassName="h-9 w-full text-xs sm:w-auto"
                  options={[
                    { value: "newest", label: "Newest" },
                    { value: "oldest", label: "Oldest" },
                    ...(isOwner ? [{ value: "title", label: "Title" }] : []),
                    { value: "priority", label: "Priority" },
                    { value: "status", label: "Status" },
                  ]}
                />
                {isOwner && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={openCreateForm}
                    >
                      <Plus /> Add task
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleGenerate}
                      disabled={
                        isGenerating ||
                        createTasksMutation.isPending ||
                        assigneesLoading
                      }
                    >
                      <Sparkles />
                      {isGenerating || createTasksMutation.isPending
                        ? "Generating..."
                        : "Generate with AI"}
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 border-b pb-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <SlidersHorizontal className="size-3.5" />
                Filters
              </span>
              <Select
                ariaLabel="Filter by status"
                value={statusFilter}
                onValueChange={setStatusFilter}
                triggerClassName="h-8 w-full text-xs sm:w-auto"
                options={[
                  { value: "all", label: "All statuses" },
                  ...statusOptions,
                ]}
                renderValue={(option) =>
                  !option || option.value === "all" ? "Status" : option.label
                }
              />
              <Select
                ariaLabel="Filter by priority"
                value={priorityFilter}
                onValueChange={setPriorityFilter}
                triggerClassName="h-8 w-full text-xs sm:w-auto"
                options={priorityOptions}
                renderValue={(option) =>
                  option?.value === "all" ? "Priority" : option?.label
                }
              />
              {isOwner && (
                <>
                  <Select
                    ariaLabel="Filter by assignee"
                    value={assigneeFilter}
                    onValueChange={setAssigneeFilter}
                    className="w-full sm:max-w-56"
                    triggerClassName="h-8 w-full text-xs"
                    options={[
                      { value: "all", label: "All assignees" },
                      { value: "unassigned", label: "Unassigned" },
                      ...assignees.map((person) => ({
                        value: person.id,
                        label: `${person.name || person.username} (@${person.username})`,
                      })),
                    ]}
                    renderValue={(option) =>
                      option?.value === "all" ? "Assignee" : option?.label
                    }
                  />
                  <Select
                    ariaLabel="Filter by source"
                    value={sourceFilter}
                    onValueChange={setSourceFilter}
                    triggerClassName="h-8 w-full text-xs sm:w-auto"
                    options={[
                      { value: "all", label: "All sources" },
                      { value: "manual", label: "Manual" },
                      { value: "ai", label: "AI generated" },
                    ]}
                    renderValue={(option) =>
                      option?.value === "all" ? "Source" : option?.label
                    }
                  />
                </>
              )}
              <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <ArrowDownWideNarrow className="size-3.5" />
                {visibleTasks.length} shown
              </span>
            </div>
          </section>

          {tasksLoading ? (
            <div aria-label="Loading tasks" className="space-y-2.5">
              <div className="h-28 animate-pulse rounded-md bg-muted" />
              <div className="h-28 animate-pulse rounded-md bg-muted" />
            </div>
          ) : tasksError ? (
            <div
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              Unable to load tasks:{" "}
              {taskQueryError instanceof Error
                ? taskQueryError.message
                : "Please try again."}
            </div>
          ) : tasks.length === 0 ? (
            <div className="rounded-md border border-dashed p-8 text-center">
              <h2 className="font-medium">
                {isOwner ? "No tasks yet" : "No tasks assigned to you"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isOwner
                  ? "Create your first task or generate tasks with TaskerAI."
                  : "Your project owner hasn't assigned any tasks to you yet."}
              </p>
              {isOwner && (
                <div className="mt-4 flex justify-center gap-2">
                  <Button variant="outline" onClick={openCreateForm}>
                    <Plus />
                    Add task
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || createTasksMutation.isPending}
                  >
                    <Sparkles />
                    Generate with AI
                  </Button>
                </div>
              )}
            </div>
          ) : visibleTasks.length === 0 ? (
            <div className="rounded-md border border-dashed p-8 text-center">
              <h2 className="font-medium">No matching tasks</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <TaskList
              tasks={visibleTasks}
              isOwner={isOwner}
              currentUserId={user.id}
              assignees={assignees}
              completingTaskId={
                completeTaskMutation.isPending
                  ? completeTaskMutation.variables?.taskId
                  : undefined
              }
              onEdit={openEditForm}
              onDelete={setDeleteCandidate}
              onComplete={(task) => void handleComplete(task)}
              onStatusChange={(task, status) =>
                void handleStatusChange(task, status)
              }
              updatingStatusTaskId={
                updateTaskMutation.isPending
                  ? updateTaskMutation.variables?.taskId
                  : undefined
              }
            />
          )}
        </>
      )}

      {selectedProject && isOwner && (
        <TaskFormDialog
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setEditingTask(null);
          }}
          projectId={selectedProject.id}
          userId={user.id}
          task={editingTask}
          assignees={assignees}
          assigneesLoading={assigneesLoading}
          onSuccess={(message) => setNotice({ kind: "success", message })}
        />
      )}

      <Dialog
        open={Boolean(deleteCandidate)}
        onOpenChange={(open) => {
          if (!open && !deleteTaskMutation.isPending) setDeleteCandidate(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete task?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. “{deleteCandidate?.title}” will be
              permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteCandidate(null)}
              disabled={deleteTaskMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleDelete()}
              disabled={deleteTaskMutation.isPending}
            >
              {deleteTaskMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
