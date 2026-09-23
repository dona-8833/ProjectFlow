import { createClient } from "@/lib/supabase/client";
import type { ProjectSchemaData } from "../schemas/projectSchema";

export type ProjectRecord = {
  id: string;
  title: string;
  description?: string | null;
  created_at?: string;
  owner_id?: string;
};

export type CollaboratorOption = {
  id: string;
  username: string;
  name?: string | null;
};

export type Collab = {
  id?: string;
  project_id: string;
  user_id: string;
  role: string;
};

export type ProjectGroups = {
  owned: ProjectRecord[];
  invited: ProjectRecord[];
};

const supabase = createClient();

export const getProjects = async (userId?: string): Promise<ProjectGroups> => {
  const authUserId = userId ?? (await getCurrentAuthUserId());

  if (!authUserId) {
    return { owned: [], invited: [] };
  }

  const { data: ownedProjects, error: ownedError } = await supabase
    .from("projects")
    .select("*")
    .eq("owner_id", authUserId)
    .order("created_at", { ascending: false });

  if (ownedError) {
    throw new Error(ownedError.message);
  }

  const { data: collaboratorRows, error: collabError } = await supabase
    .from("project_collaborators")
    .select("project_id, user_id")
    .eq("user_id", authUserId);

  if (collabError) {
    throw new Error(collabError.message);
  }

  const invitedProjectIds = [
    ...new Set(
      (collaboratorRows ?? [])
        .map((row) => row.project_id)
        .filter((projectId): projectId is string => Boolean(projectId)),
    ),
  ];

  const invited = invitedProjectIds.length
    ? await fetchInvitedProjects(invitedProjectIds, authUserId)
    : [];

  return {
    owned: (ownedProjects ?? []) as ProjectRecord[],
    invited,
  };
};

const getCurrentAuthUserId = async (): Promise<string | null> => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user.id;
};

const fetchInvitedProjects = async (
  invitedProjectIds: string[],
  userId: string,
): Promise<ProjectRecord[]> => {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .in("id", invitedProjectIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).filter(
    (project) => project.owner_id !== userId,
  ) as ProjectRecord[];
};

export const searchUsersByUsername = async (
  username: string,
  currentUserId?: string,
): Promise<CollaboratorOption[]> => {
  const trimmed = username.trim();

  if (!trimmed) {
    return [];
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, name")
    .ilike("username", `${trimmed}%`)
    .limit(8);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? [])
    .filter((profile) => profile.id !== currentUserId)
    .map((profile) => ({
      id: profile.id,
      username: profile.username,
      name: profile.name,
    })) as CollaboratorOption[];
};

export const createProject = async (data: ProjectSchemaData) => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("You must be logged in to create a project.");
  }
  const { data: newProject, error: projectError } = await supabase
    .from("projects")
    .insert({
      title: data.title,
      description: data.description,
      owner_id: user.id,
    })
    .select()
    .single();
  if (projectError) {
    throw new Error(projectError.message);
  }
  if (data.collaborators && data.collaborators.length > 0) {
    const collaboratorRows = data.collaborators.map((collaboratorId) => ({
      project_id: newProject.id,
      user_id: collaboratorId,
      role: "viewer",
    }));
    const { error: collabError } = await supabase
      .from("project_collaborators")
      .insert(collaboratorRows);
    if (collabError) {
      throw new Error(
        "Project created, but failed to add collaborators: " +
          collabError.message,
      );
    }
  }
  return newProject;
};

export const updateProject = async ({
  id,
  title,
  description,
}: {
  id: string;
  title: string;
  description?: string | null;
}) => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be logged in to update a project.");
  }

  const { data, error } = await supabase
    .from("projects")
    .update({
      title,
      description: description ?? "",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("owner_id", user.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deleteProject = async (projectId: string) => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be logged in to delete a project.");
  }

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("owner_id", user.id);

  if (error) {
    throw new Error(error.message);
  }
};

export const addProjectCollaborator = async (
  projectId: string,
  userId: string,
  role = "viewer",
) => {
  const { error } = await supabase.from("project_collaborators").insert({
    project_id: projectId,
    user_id: userId,
    role,
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const removeProjectCollaborator = async (
  projectId: string,
  userId: string,
) => {
  const { error } = await supabase
    .from("project_collaborators")
    .delete()
    .eq("project_id", projectId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
};

export const getCollab = async (projectId: string): Promise<Collab[]> => {
  const { data, error } = await supabase
    .from("project_collaborators")
    .select("*")
    .eq("project_id", projectId);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Collab[];
};
