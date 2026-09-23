import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { useCreateProject } from "../hooks/useProjects";
import {
  createProjectSchema,
  type ProjectSchemaData,
  type ProjectSchemaFormData,
} from "../schemas/projectSchema";
import {
  searchUsersByUsername,
  type CollaboratorOption,
} from "../services/projectService";

type CreateProjectDialogProps = {
  userId?: string;
  disabled?: boolean;
  onCreated?: () => void;
};

const CreateProjectDialog = ({
  userId,
}: CreateProjectDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [availableUsers, setAvailableUsers] = useState<CollaboratorOption[]>(
    [],
  );
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<CollaboratorOption[]>([]);
  const { mutateAsync: createProjectMutation } = useCreateProject();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProjectSchemaFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      collaborators: [],
    },
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timeout = setTimeout(async () => {
      const trimmed = searchTerm.trim();

      if (!trimmed) {
        setAvailableUsers([]);
        setIsSearching(false);
        return;
      }

      try {
        setIsSearching(true);
        const results = await searchUsersByUsername(trimmed, userId);
        setAvailableUsers(
          results.filter(
            (person) =>
              !selectedUsers.some((selected) => selected.id === person.id),
          ),
        );
      } catch {
        setAvailableUsers([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchTerm, isOpen, userId, selectedUsers]);

  useEffect(() => {
    setValue(
      "collaborators",
      selectedUsers.map((user) => user.id),
      {
        shouldValidate: true,
      },
    );
  }, [selectedUsers, setValue]);

  const removeCollaborator = (userIdToRemove: string) => {
    setSelectedUsers((current) =>
      current.filter((person) => person.id !== userIdToRemove),
    );
  };

  const addCollaborator = (person: CollaboratorOption) => {
    setSelectedUsers((current) => {
      const alreadyAdded = current.some((entry) => entry.id === person.id);
      if (alreadyAdded) {
        return current;
      }

      return [...current, person];
    });
    setSearchTerm("");
    setAvailableUsers([]);
  };

  const resetForm = () => {
    reset();
    setSearchTerm("");
    setAvailableUsers([]);
    setSelectedUsers([]);
  };

  const onSubmit = async (data: ProjectSchemaFormData) => {
    try {
      const payload: ProjectSchemaData = {
        title: data.title,
        description: data.description ?? "",
        collaborators: selectedUsers.map((person) => person.id),
      };

      await createProjectMutation(payload);
      resetForm();
      setIsOpen(false);
    } catch (error: any) {
      setError("root", {
        type: "manual",
        message: error?.message || "Failed to create project",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <Button
          type="button"
          variant="default"
          size="sm"
          className="bg-slate-900 text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {
            userId
              ? "New Project"
              : "Sign in to create"}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>
            Add project details and invite teammates to collaborate.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div>
            <label
              htmlFor="title"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              {...register("title")}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              {...register("description")}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Collaborators
            </label>

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by username"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />

            {isSearching && (
              <p className="mt-2 text-xs text-slate-500">Searching users...</p>
            )}

            {availableUsers.length > 0 && (
              <div className="mt-2 space-y-2 rounded-md border border-slate-200 bg-slate-50 p-2">
                {availableUsers.map((person) => (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => addCollaborator(person)}
                    className="flex w-full items-center justify-between rounded-md border border-slate-200 bg-white px-2 py-2 text-left text-sm hover:bg-slate-100"
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
                    <span className="text-xs text-slate-500">Select</span>
                  </button>
                ))}
              </div>
            )}

            {selectedUsers.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedUsers.map((person) => (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => removeCollaborator(person.id)}
                    className="rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                  >
                    @{person.username} ×
                  </button>
                ))}
              </div>
            )}

            {!selectedUsers.length && (
              <p className="mt-2 text-xs text-slate-500">
                No collaborators selected yet.
              </p>
            )}
          </div>

          {errors.root && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errors.root.message}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
