import { useAuthStore } from "@/app/store/authStore";

import CreateProjectDialog from "./components/CreateProjectDialog";
import ProjectList from "./components/ProjectList";
import { useProject } from "./hooks/useProjects";

export default function Projects() {
  const user = useAuthStore((state) => state.user);
  const { data: projectGroups, isLoading, isError } = useProject(user?.id);

  const ownedProjects = projectGroups?.owned ?? [];
  const invitedProjects = projectGroups?.invited ?? [];
  const isCollaboratorOnly =
    !!user?.id && ownedProjects.length === 0 && invitedProjects.length > 0;

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Workspace
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Projects
          </h1>
        </div>

        <CreateProjectDialog userId={user?.id} disabled={isCollaboratorOnly} />
      </div>

      <ProjectList
        projects={projectGroups}
        isLoading={isLoading}
        isError={isError}
      />
    </main>
  );
}
