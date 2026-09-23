import { useEffect, useState } from "react";

import { useAuthStore } from "@/app/store/authStore";
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
import {
  useAddProjectCollaborator,
  useCollab,
  useDeleteProject,
  useProject,
  useRemoveProjectCollaborator,
  useUpdateProject,
} from "../hooks/useProjects";
import {
  searchUsersByUsername,
  type CollaboratorOption,
  type Collab,
  type ProjectGroups,
  type ProjectRecord,
} from "../services/projectService";

type ProjectListProps = {
  projects?: ProjectGroups;
  isLoading?: boolean;
  isError?: boolean;
};

const ProjectList = ({
  projects: providedProjects,
  isLoading: providedLoading,
  isError: providedError,
}: ProjectListProps) => {
  const fallback = useProject();

  const projectGroups = providedProjects ??
    fallback.data ?? { owned: [], invited: [] };
  const isLoading = providedLoading ?? fallback.isLoading;
  const isError = providedError ?? fallback.isError;

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <p className="text-gray-500">Loading your projects...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-red-600">
        <p>Failed to load projects. Please refresh the page.</p>
      </div>
    );
  }

  const hasProjects =
    projectGroups.owned.length > 0 || projectGroups.invited.length > 0;

  if (!hasProjects) {
    return (
      <div className="flex h-32 flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-200 bg-gray-50">
        <p className="text-gray-500">You don't have any projects yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ProjectSection
        title="Owned Projects"
        projects={projectGroups.owned}
        emptyMessage="You haven't created any projects yet."
        readOnly={false}
      />

      <ProjectSection
        title="Invited Projects"
        projects={projectGroups.invited}
        emptyMessage="No project invites yet."
        readOnly={true}
      />
    </div>
  );
};

export default ProjectList;

const ProjectSection = ({
  title,
  projects,
  emptyMessage,
  readOnly,
}: {
  title: string;
  projects: ProjectRecord[];
  emptyMessage: string;
  readOnly: boolean;
}) => {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
          {projects.length}
        </span>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          {emptyMessage}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}
    </section>
  );
};

const ProjectCard = ({
  project,
  readOnly = false,
}: {
  project: ProjectRecord;
  readOnly?: boolean;
}) => {
  const { data: collaborators = [], isLoading: collaboratorsLoading } =
    useCollab(project.id);
  const { mutateAsync: updateProject, isPending: isUpdating } =
    useUpdateProject();
  const { mutateAsync: deleteProject, isPending: isDeleting } =
    useDeleteProject();
  const { mutateAsync: addCollaborator } = useAddProjectCollaborator();
  const { mutateAsync: removeCollaborator } = useRemoveProjectCollaborator();
  const currentUser = useAuthStore((state) => state.user);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description ?? "");
  const [editSearchTerm, setEditSearchTerm] = useState("");
  const [editAvailableUsers, setEditAvailableUsers] = useState<
    CollaboratorOption[]
  >([]);
  const [editIsSearching, setEditIsSearching] = useState(false);
  const [editSelectedUserIds, setEditSelectedUserIds] = useState<string[]>([]);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (!isEditDialogOpen) {
      return;
    }

    setEditSelectedUserIds(
      collaborators.map((collaborator) => collaborator.user_id),
    );
  }, [isEditDialogOpen, collaborators]);

  useEffect(() => {
    if (!isEditDialogOpen) {
      return;
    }

    const timeout = setTimeout(async () => {
      const trimmed = editSearchTerm.trim();

      if (!trimmed) {
        setEditAvailableUsers([]);
        setEditIsSearching(false);
        return;
      }

      try {
        setEditIsSearching(true);
        const results = await searchUsersByUsername(trimmed, currentUser?.id);
        setEditAvailableUsers(
          results.filter((person) => !editSelectedUserIds.includes(person.id)),
        );
      } catch {
        setEditAvailableUsers([]);
      } finally {
        setEditIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [editSearchTerm, isEditDialogOpen, currentUser?.id, editSelectedUserIds]);

  const handleSave = async () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    const currentIds = new Set(
      collaborators.map((collaborator) => collaborator.user_id),
    );
    const nextIds = new Set(editSelectedUserIds);

    const toAdd = [...nextIds].filter((userId) => !currentIds.has(userId));
    const toRemove = [...currentIds].filter((userId) => !nextIds.has(userId));

    await updateProject({
      id: project.id,
      title: trimmedTitle,
      description,
    });

    for (const userId of toAdd) {
      await addCollaborator({ projectId: project.id, userId });
    }

    for (const userId of toRemove) {
      await removeCollaborator({ projectId: project.id, userId });
    }

    setIsEditDialogOpen(false);
  };

  const handleDelete = async () => {
    await deleteProject(project.id);
    setIsConfirmDeleteOpen(false);
  };

  const handleAddCollaborator = (person: CollaboratorOption) => {
    setEditSelectedUserIds((current) =>
      current.includes(person.id) ? current : [...current, person.id],
    );
    setEditSearchTerm("");
    setEditAvailableUsers([]);
  };

  const handleRemoveCollaborator = (userId: string) => {
    setEditSelectedUserIds((current) => current.filter((id) => id !== userId));
  };

  return (
    <div
      aria-disabled={readOnly}
      className={[
        "flex flex-col rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow",
        readOnly
          ? "cursor-not-allowed select-none opacity-80 pointer-events-none"
          : "hover:shadow-md",
      ].join(" ")}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>

        {readOnly && (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-700">
            View only
          </span>
        )}
      </div>

      {project.description ? (
        <p className="mt-2 line-clamp-2 text-sm text-gray-600">
          {project.description}
        </p>
      ) : null}

      {!readOnly && (
        <div className="mt-4 flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setTitle(project.title);
              setDescription(project.description ?? "");
              setEditSearchTerm("");
              setEditAvailableUsers([]);
              setEditSelectedUserIds(
                collaborators.map((collaborator) => collaborator.user_id),
              );
              setIsEditDialogOpen(true);
            }}
          >
            Edit
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={() => setIsConfirmDeleteOpen(true)}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      )}

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);

          if (!open) {
            setEditSearchTerm("");
            setEditAvailableUsers([]);
          }
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit project</DialogTitle>
            <DialogDescription>
              Update the project details and manage collaborators.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <label
                htmlFor={`project-title-${project.id}`}
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Title
              </label>
              <input
                id={`project-title-${project.id}`}
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label
                htmlFor={`project-description-${project.id}`}
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Description
              </label>
              <textarea
                id={`project-description-${project.id}`}
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                placeholder="Project description"
              />
            </div>

            <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3">
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Collaborators
              </label>

              <input
                type="text"
                value={editSearchTerm}
                onChange={(event) => setEditSearchTerm(event.target.value)}
                placeholder="Search users by username"
                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-sm outline-none focus:border-slate-500"
              />

              {editIsSearching && (
                <p className="text-xs text-slate-500">Searching users...</p>
              )}

              {editAvailableUsers.length > 0 && (
                <div className="space-y-2 rounded-md border border-slate-200 bg-white p-2">
                  {editAvailableUsers.map((person) => (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => handleAddCollaborator(person)}
                      className="flex w-full items-center justify-between rounded-md border border-slate-200 px-2 py-2 text-left text-sm hover:bg-slate-100"
                    >
                      <span>
                        <span className="font-medium text-slate-800">
                          @{person.username}
                        </span>
                        {person.name && (
                          <span className="ml-2 text-slate-500">
                            {person.name}
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-slate-500">Add</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {editSelectedUserIds.map((userId) => (
                  <EditCollaboratorPill
                    key={userId}
                    userId={userId}
                    onRemove={handleRemoveCollaborator}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isUpdating || !title.trim()}
            >
              {isUpdating ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isConfirmDeleteOpen}
        onOpenChange={(open) => setIsConfirmDeleteOpen(open)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete project?</DialogTitle>
            <DialogDescription>
              This will permanently remove "{project.title}" and its
              collaborator access. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mt-4">
        {collaboratorsLoading ? (
          <p className="text-xs text-gray-500">Loading collaborators...</p>
        ) : collaborators && collaborators.length > 0 ? (
          <div className="flex -space-x-2">
            {collaborators.map((collaborator) => (
              <Collaborator
                key={collaborator.user_id}
                collaborator={collaborator}
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500">No collaborators yet</p>
        )}
      </div>
    </div>
  );
};

const EditCollaboratorPill = ({
  userId,
  onRemove,
}: {
  userId: string;
  onRemove: (userId: string) => void;
}) => {
  const { data: profile, isLoading, isError } = useProfile(userId);

  if (isLoading) {
    return (
      <span className="rounded-full bg-slate-200 px-2 py-1 text-xs text-slate-600">
        Loading...
      </span>
    );
  }

  if (isError || !profile) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => onRemove(userId)}
      className="flex items-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
    >
      <span>@{profile.username || "user"}</span>
      <span>×</span>
    </button>
  );
};

const Collaborator = ({ collaborator }: { collaborator: Collab }) => {
  const {
    data: profile,
    isLoading,
    isError,
  } = useProfile(collaborator.user_id);

  if (isLoading) {
    return (
      <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-200" />
    );
  }

  if (isError || !profile) {
    return null;
  }

  const displayName = typeof profile?.name === "string" ? profile.name : "";
  const initials =
    displayName
      .split(" ")
      .filter((piece: string) => Boolean(piece))
      .slice(0, 2)
      .map((piece: string) => piece[0]?.toUpperCase() ?? "")
      .join("") ||
    profile?.username?.slice(0, 2).toUpperCase() ||
    "U";

  return (
    <div className="group relative inline-flex items-center gap-2">
      {profile.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt={profile.username || "Collaborator avatar"}
          className="h-8 w-8 rounded-full border-2 border-white object-cover shadow-sm"
          title={`${profile.name || profile.username} (${collaborator.role})`}
        />
      ) : (
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-800 text-[10px] font-semibold text-white shadow-sm"
          title={`${profile.name || profile.username} (${collaborator.role})`}
        >
          {initials}
        </div>
      )}
    </div>
  );
};
