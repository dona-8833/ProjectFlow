import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  FolderKanban,
  ListTodo,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { useAuthStore } from "@/app/store/authStore";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProject } from "@/features/projects/hooks/useProjects";
import type { ProjectRecord } from "@/features/projects/services/projectService";
import {
  useProfile,
  useProfileSummaries,
} from "@/features/settings/hooks/userProfile";
import { useTasksForProjects } from "@/features/tasks/hooks/useTasks";
import type { Task, TaskStatus } from "@/features/tasks/types/task.types";

type TaskFilter = "all" | TaskStatus;

const statusStyles: Record<TaskStatus, string> = {
  todo: "bg-[#f3f4f6] text-[#4b5563]",
  in_progress: "bg-[#eff6ff] text-[#1d4ed8]",
  done: "bg-[#ecfdf3] text-[#027a48]",
  canceled: "bg-[#fef2f2] text-[#b42318]",
};

const statusLabels: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
  canceled: "Canceled",
};

const priorityStyles = {
  low: "bg-[#f3f4f6] text-[#4b5563]",
  medium: "bg-[#fffaeb] text-[#b54708]",
  high: "bg-[#fef3f2] text-[#b42318]",
} as const;

function formatDate(value?: string) {
  if (!value) return "Recently added";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently added";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
}

function ProjectProgress({
  project,
  tasks,
  loading,
  index,
  currentUserId,
}: {
  project: ProjectRecord;
  tasks: Task[];
  loading: boolean;
  index: number;
  currentUserId: string;
}) {
  const completed = tasks.filter((task) => task.status === "done").length;
  const total = tasks.length;
  const percentage = total ? Math.round((completed / total) * 100) : 0;
  const shared = project.owner_id !== currentUserId;

  return (
    <Link
      to={`/app/tasks?project=${project.id}`}
      className="group flex min-h-44 flex-col rounded-md border border-[#e5e5e5] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.025)] transition hover:border-[#929292] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-[5px] ${index % 3 === 1 ? "bg-[#f1f1f1] text-[#303030]" : "bg-[#e9e9e9] text-[#161616]"}`}
        >
          <FolderKanban className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-sm font-semibold text-[#242424] group-hover:text-black">
              {project.title}
            </h3>
            <span className="shrink-0 rounded-full bg-[#f1f1f1] px-2 py-0.5 text-[10px] text-[#444444]">
              {shared ? "Shared" : "Owner"}
            </span>
          </div>
          <p className="mt-1 line-clamp-1 text-xs text-[#626262]">
            {project.description || "Project workspace"}
          </p>
        </div>
      </div>

      <div className="mt-auto pt-6">
        {loading ? (
          <Skeleton className="h-4 w-full" />
        ) : (
          <>
            <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px]">
              <span className="text-[#4f4f4f]">
                {completed}/{total} tasks done
              </span>
              <span className="font-semibold text-[#303030]">
                {percentage}%
              </span>
            </div>
            <div
              role="progressbar"
              aria-label={`${project.title} task completion`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percentage}
              className="h-1.5 overflow-hidden rounded-full bg-[#e9e9e9]"
            >
              <div
                className="h-full rounded-full bg-[#181818] transition-[width] duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </>
        )}
      </div>
    </Link>
  );
}

function Assignee({
  userId,
  profiles,
}: {
  userId: string | null;
  profiles: ReturnType<typeof useProfileSummaries>["data"];
}) {
  if (!userId)
    return <span className="text-[11px] text-[#625c63]">Unassigned</span>;
  const profile = profiles?.find((person) => person.id === userId);
  const label = profile?.name || profile?.username || "Assigned";
  return (
    <span className="inline-flex items-center gap-1.5" title={label}>
      {profile?.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt=""
          className="size-6 rounded-full border border-white object-cover"
        />
      ) : (
        <span className="flex size-6 items-center justify-center rounded-full bg-[#222222] text-[9px] font-semibold text-white">
          {label.slice(0, 1).toUpperCase()}
        </span>
      )}
      <span className="hidden max-w-20 truncate text-[11px] text-[#514b52] sm:block">
        {label}
      </span>
    </span>
  );
}

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const { data: profile } = useProfile(user?.id);
  const {
    data: projectGroups,
    isLoading: projectsLoading,
    isError: projectsError,
  } = useProject(user?.id);
  const projects = useMemo(
    () =>
      [...(projectGroups?.owned ?? []), ...(projectGroups?.invited ?? [])].sort(
        (left, right) =>
          (right.created_at ?? "").localeCompare(left.created_at ?? ""),
      ),
    [projectGroups],
  );
  const projectIds = useMemo(
    () => projects.map((project) => project.id),
    [projects],
  );
  const taskQueries = useTasksForProjects(projectIds);
  const taskLoading = taskQueries.some((query) => query.isLoading);
  const taskError = taskQueries.some((query) => query.isError);
  const projectTasks = useMemo(
    () =>
      new Map(
        projectIds.map((id, index) => [id, taskQueries[index]?.data ?? []]),
      ),
    [projectIds, taskQueries],
  );
  const allTasks = useMemo(
    () => [...projectTasks.values()].flat(),
    [projectTasks],
  );
  const assignedUserIds = useMemo(
    () => [
      ...new Set(
        allTasks
          .map((task) => task.assigned_to)
          .filter((id): id is string => Boolean(id)),
      ),
    ],
    [allTasks],
  );
  const { data: profiles = [] } = useProfileSummaries(assignedUserIds);
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("all");
  const [search, setSearch] = useState("");

  const projectTitleById = useMemo(
    () => new Map(projects.map((project) => [project.id, project.title])),
    [projects],
  );
  const matchingTasks = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return [...allTasks]
      .filter((task) => taskFilter === "all" || task.status === taskFilter)
      .filter(
        (task) =>
          !query ||
          task.title.toLocaleLowerCase().includes(query) ||
          (task.description ?? "").toLocaleLowerCase().includes(query) ||
          (projectTitleById.get(task.project_id) ?? "")
            .toLocaleLowerCase()
            .includes(query),
      )
      .sort((left, right) => right.created_at.localeCompare(left.created_at))
      .slice(0, 6);
  }, [allTasks, taskFilter, search, projectTitleById]);

  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(
    (task) => task.status === "done",
  ).length;
  const inProgressTasks = allTasks.filter(
    (task) => task.status === "in_progress",
  ).length;
  const completionRate = totalTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;
  const recentProjects = projects.slice(0, 3);
  const firstName =
    profile?.name?.trim().split(/\s+/)[0] ||
    user?.email?.split("@")[0] ||
    "there";

  return (
    <main className="mx-auto w-full max-w-360 space-y-6 rounded-md   sm:p-5 lg:p-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#626262]">
            Workspace / Overview
          </p>
          <h1 className="mt-2 text-[26px] font-semibold leading-tight tracking-[-0.035em] text-[#211e23] sm:text-[30px]">
            Good morning, {firstName}
          </h1>
          <p className="mt-1 text-sm text-[#5f5f5f]">
            Here&apos;s what&apos;s happening across your projects and tasks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="relative hidden min-w-48 flex-1 sm:block lg:min-w-60">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#8f8791]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tasks..."
              className="h-9 w-full rounded-md border border-[#e5e5e5] bg-white pl-8 pr-3 text-xs outline-none placeholder:text-[#666666] focus:border-[#555555]"
            />
          </label>
          <Button
            variant="outline"
            size="sm"
            render={<Link to="/app/tasks" />}
            className="h-9 border-[#e5e5e5] bg-white text-xs"
          >
            <SlidersHorizontal /> Filter view
          </Button>
          <Button
            size="sm"
            render={<Link to="/app/tasks" />}
            className="h-9 bg-black text-xs text-white hover:bg-[#333333]"
          >
            <Plus /> New task
          </Button>
        </div>
      </section>

      {projectsError ? (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          Could not load your projects. Refresh and try again.
        </div>
      ) : (
        <>
          <section
            aria-label="Workspace metrics"
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          >
            <MetricCard
              title="Total projects"
              value={projectsLoading ? null : projects.length}
              detail={`${projectGroups?.owned.length ?? 0} owned · ${projectGroups?.invited.length ?? 0} shared`}
              icon={FolderKanban}
              accent="neutral"
            />
            <MetricCard
              title="Visible tasks"
              value={taskLoading ? null : totalTasks}
              detail="Across your accessible projects"
              icon={ListTodo}
              accent="neutral"
            />
            <MetricCard
              title="Completed tasks"
              value={taskLoading ? null : completedTasks}
              detail={
                taskLoading
                  ? "Loading task progress"
                  : `${completionRate}% completion rate`
              }
              icon={CheckCircle2}
              accent="dark"
              progress={!taskLoading ? completionRate : undefined}
            />
            <MetricCard
              title="In progress"
              value={taskLoading ? null : inProgressTasks}
              detail="Tasks currently underway"
              icon={CircleAlert}
              accent="dark"
            />
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-[#292929]">
                  Recent projects
                </h2>
                <span className="rounded bg-[#ededed] px-1.5 py-0.5 text-[10px] text-[#4f4f4f]">
                  {projects.length}
                </span>
              </div>
              <Link
                to="/app/projects"
                className="inline-flex items-center gap-1 text-xs font-medium text-[#4f4f4f] hover:text-black"
              >
                View all <ArrowRight className="size-3" />
              </Link>
            </div>
            {projectsLoading ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {[0, 1, 2].map((item) => (
                  <Skeleton key={item} className="h-44 rounded-md" />
                ))}
              </div>
            ) : recentProjects.length ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {recentProjects.map((project, index) => (
                  <ProjectProgress
                    key={project.id}
                    project={project}
                    tasks={projectTasks.get(project.id) ?? []}
                    loading={taskLoading}
                    index={index}
                    currentUserId={user?.id ?? ""}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-[#d7d7d7] bg-white p-7 text-center">
                <FolderKanban className="mx-auto size-5 text-[#777777]" />
                <p className="mt-2 text-sm font-medium text-[#393939]">
                  No projects yet
                </p>
                <p className="mt-1 text-xs text-[#777777]">
                  Create or join a project to see it here.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link to="/app/projects" />}
                  className="mt-3"
                >
                  Go to projects
                </Button>
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-md border border-[#e5e5e5] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.025)]">
            <div className="flex flex-col gap-3 border-b border-[#ededed] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-sm font-semibold text-[#292929]">
                  Recent tasks
                </h2>
                <div
                  role="group"
                  aria-label="Filter recent tasks"
                  className="flex items-center rounded-md bg-[#f1f1f1] p-0.5"
                >
                  {(
                    ["all", "todo", "in_progress", "done", "canceled"] as const
                  ).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      aria-pressed={taskFilter === filter}
                      onClick={() => setTaskFilter(filter)}
                      className={`rounded px-2 py-1 text-[10px] transition ${taskFilter === filter ? "bg-white font-medium text-[#222222] shadow-sm" : "text-[#5f5f5f] hover:text-[#222222]"}`}
                    >
                      {filter === "all" ? "All" : statusLabels[filter]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <label className="relative sm:hidden">
                  <Search className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-[#8f8791]" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search"
                    className="h-8 w-28 rounded border border-[#e5e5e5] pl-7 pr-2 text-[11px] outline-none focus:border-[#555555]"
                  />
                </label>
                <Link
                  to="/app/tasks"
                  className="inline-flex shrink-0 items-center gap-1 text-xs text-[#4f4f4f] hover:text-black"
                >
                  View all tasks <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>

            {taskLoading ? (
              <div className="space-y-2 p-4">
                {[0, 1, 2, 3].map((item) => (
                  <Skeleton key={item} className="h-9 w-full" />
                ))}
              </div>
            ) : taskError ? (
              <div
                role="alert"
                className="m-4 rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700"
              >
                Some task data could not be loaded. Task visibility follows your
                project permissions.
              </div>
            ) : matchingTasks.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-170 border-collapse text-left">
                  <thead className="bg-[#fafafa] text-[11px] font-medium uppercase tracking-[0.08em] text-[#555555]">
                    <tr>
                      <th className="px-4 py-2.5">Task</th>
                      <th className="px-3 py-2.5">Project</th>
                      <th className="px-3 py-2.5">Status</th>
                      <th className="px-3 py-2.5">Priority</th>
                      <th className="px-3 py-2.5">Created</th>
                      <th className="px-4 py-2.5 text-right">Assignee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eeeeee] text-xs">
                    {matchingTasks.map((task) => (
                      <RecentTaskRow
                        key={task.id}
                        task={task}
                        projectTitle={
                          projectTitleById.get(task.project_id) ?? "Project"
                        }
                        profiles={profiles}
                      />
                    ))}
                  </tbody>
                </table>
                <div className="flex items-center justify-between border-t border-[#ededed] px-4 py-2.5 text-[11px] text-[#555555]">
                  <span>
                    Showing {matchingTasks.length} of {totalTasks} accessible
                    tasks
                  </span>
                  <ClipboardList className="size-3.5" />
                </div>
              </div>
            ) : (
              <div className="px-4 py-10 text-center">
                <Check className="mx-auto size-5 text-[#777777]" />
                <p className="mt-2 text-sm font-medium text-[#393939]">
                  {allTasks.length ? "No matching tasks" : "No tasks yet"}
                </p>
                <p className="mt-1 text-xs text-[#777777]">
                  {allTasks.length
                    ? "Try a different status filter or search."
                    : "Create a task from a project to populate your dashboard."}
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
  accent,
  progress,
}: {
  title: string;
  value: number | null;
  detail: string;
  icon: typeof FolderKanban;
  accent: "neutral" | "dark";
  progress?: number;
}) {
  const iconColor =
    accent === "dark"
      ? "text-white bg-[#202020]"
      : "text-[#555555] bg-[#f0f0f0]";
  return (
    <article className="min-h-28 rounded-md border border-[#e5e5e5] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.025)]">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-medium text-[#505050]">{title}</h2>
        <span
          className={`flex size-7 items-center justify-center rounded-lg ${iconColor}`}
        >
          <Icon className="size-3.5" />
        </span>
      </div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-[27px] font-semibold leading-none tracking-[-0.04em] text-[#211e23]">
          {value === null ? <Skeleton className="h-7 w-12" /> : value}
        </p>
        <p className="max-w-[68%] pb-0.5 text-right text-[11px] leading-4 text-[#555555]">
          {detail}
        </p>
      </div>
      {progress !== undefined ? (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#e9e9e9]">
          <div
            className="h-full rounded-full bg-[#171717]"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : (
        <div className="mt-3 h-1 rounded-full bg-[#f0f0f0]" />
      )}
    </article>
  );
}

function RecentTaskRow({
  task,
  projectTitle,
  profiles,
}: {
  task: Task;
  projectTitle: string;
  profiles: ReturnType<typeof useProfileSummaries>["data"];
}) {
  return (
    <tr className="transition hover:bg-[#fafafa]">
      <td className="max-w-70 px-4 py-3">
        <Link
          to={`/app/tasks?project=${task.project_id}`}
          className="block truncate font-medium text-[#302b32] hover:text-black"
          title={task.title}
        >
          {task.title}
        </Link>
        <span className="mt-0.5 block truncate text-[11px] text-[#626262]">
          {task.source === "ai" ? "AI generated" : "Manual"}
        </span>
      </td>
      <td className="max-w-37.5 truncate px-3 py-3 text-[#505050]">
        {projectTitle}
      </td>
      <td className="px-3 py-3">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] ${statusStyles[task.status]}`}
        >
          <span className="size-1 rounded-full bg-current" />
          {statusLabels[task.status]}
        </span>
      </td>
      <td className="px-3 py-3">
        <span
          className={`rounded px-2 py-1 text-[10px] ${priorityStyles[task.priority]}`}
        >
          {task.priority}
        </span>
      </td>
      <td className="whitespace-nowrap px-3 py-3 font-mono text-[11px] text-[#505050]">
        {formatDate(task.created_at)}
      </td>
      <td className="px-4 py-3 text-right">
        <span className="inline-flex justify-end">
          <Assignee userId={task.assigned_to} profiles={profiles} />
        </span>
      </td>
    </tr>
  );
}
