import * as z from "zod";

export const createProjectSchema = z.object({
  title: z.string().trim().min(1, "Project title is required"),
  description: z.string().trim().optional().or(z.literal("")),
  collaborators: z.array(z.string()).optional().default([]),
});

export type ProjectSchemaFormData = z.input<typeof createProjectSchema>;
export type ProjectSchemaData = z.output<typeof createProjectSchema>;
