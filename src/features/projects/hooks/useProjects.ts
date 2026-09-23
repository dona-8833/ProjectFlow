import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addProjectCollaborator,
  type Collab,
  createProject,
  deleteProject,
  getCollab,
  getProjects,
  type ProjectGroups,
  removeProjectCollaborator,
  updateProject,
} from "../services/projectService";

export const useProject = (userId?: string) =>
  useQuery<ProjectGroups>({
    queryKey: ["projects", userId],
    queryFn: () => getProjects(userId),
    enabled: !!userId,
  });

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

export const useAddProjectCollaborator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      userId,
    }: {
      projectId: string;
      userId: string;
    }) => addProjectCollaborator(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["collaboratorId"] });
    },
  });
};

export const useRemoveProjectCollaborator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      userId,
    }: {
      projectId: string;
      userId: string;
    }) => removeProjectCollaborator(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["collaboratorId"] });
    },
  });
};

export const useCollab = (projectId?: string) => {
  return useQuery<Collab[]>({
    queryKey: ["collaboratorId", projectId],
    queryFn: () => getCollab(projectId as string),
    enabled: !!projectId,
  });
};
