import { GoogleGenAI, Type } from "@google/genai";
import {
  generatedTasksSchema,
  type GeneratedTasksData,
} from "../schemas/task.schema";

/* =====================================================
   CONFIG & DEFAULT POOL
===================================================== */

const config = {
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  temperature: 0.2,
  maxOutputTokens: 4096,
};

// Modern, active Flash models (never use retired 1.5/2.0 models)
const DEFAULT_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.7-flash",
];

/* =====================================================
   GEMINI CLIENT
===================================================== */

const ai = new GoogleGenAI({
  apiKey: config.apiKey,
});

/* =====================================================
   DYNAMIC MODEL DISCOVERY & ROUTING
===================================================== */

let cachedFlashModels: string[] | null = null;
let lastWorkingModel: string | null = null;

/**
 * Dynamically queries Google for active models, filters out
 * non-generative endpoints (TTS/Image/Embeddings), and sorts by capability.
 */
async function getAvailableFlashModels(): Promise<string[]> {
  if (cachedFlashModels && cachedFlashModels.length > 0) {
    return cachedFlashModels;
  }

  try {
    const response = await ai.models.list();
    const discoveredModels: string[] = [];

    for await (const model of response) {
      const rawName = model.name || "";
      const cleanName = rawName.replace(/^models\//, "");

      // Match text/general-purpose flash models, exclude media-only/specialized models
      if (
        cleanName.toLowerCase().includes("flash") &&
        !cleanName.includes("image") &&
        !cleanName.includes("tts") &&
        !cleanName.includes("transcribe") &&
        !cleanName.includes("live") &&
        !cleanName.includes("embedding")
      ) {
        discoveredModels.push(cleanName);
      }
    }

    if (discoveredModels.length === 0) {
      cachedFlashModels = DEFAULT_MODELS;
      return cachedFlashModels;
    }

    // Rank prioritized models first, followed by other discovered models
    discoveredModels.sort((a, b) => {
      const indexA = DEFAULT_MODELS.indexOf(a);
      const indexB = DEFAULT_MODELS.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return b.localeCompare(a);
    });

    cachedFlashModels = discoveredModels;
    return cachedFlashModels;
  } catch {
    cachedFlashModels = DEFAULT_MODELS;
    return cachedFlashModels;
  }
}

/* =====================================================
   PAYLOAD & SCHEMAS
===================================================== */

export interface GenerateTasksPayload {
  projectId: string;
  title: string;
  description: string;
  ownerId: string;
  collaborators: string[];
}

export type GeneratedTasks = GeneratedTasksData;

/* =====================================================
   GENERATE TASKS
===================================================== */

export async function generateTasks(
  payload: GenerateTasksPayload,
): Promise<GeneratedTasks> {
  const prompt = `
You are a senior software architect, technical project manager, and full-stack development planner. Your responsibility is to analyze the provided project requirements and transform them into a COMPLETE, REALISTIC, PRODUCTION-READY software development blueprint. Do NOT generate vague or generic tasks. You must think through the entire project from initial setup to deployment and identify everything required to actually build the application.

========================
PROJECT INFORMATION
========================
Project Title: ${payload.title}
Project Description: ${payload.description}

========================
TASK GENERATION STRATEGY
========================
Break the project down into highly granular, production-grade tasks covering:
1. Setup & Tech Stack
2. Architecture & Folder Structure
3. DevOps & Infrastructure
4. Database & State
5. Backend APIs
6. Frontend UI
7. Testing & Security

*CRITICAL*: Use the "description" field of each task to provide EXHAUSTIVE technical detail. 
- Include recommended tech stacks, specific database tables, and DevOps pipelines.
- For the folder structure, use standard markdown line breaks and indentation to make it readable.

========================
STRICT SCHEMA RULES
========================
Return only task title, technical description, priority, and status. Set every status to "todo".
Do not include project IDs, user IDs, creator IDs, assignees, or source fields.
`;

  /* =====================================================
     SMART CASCADE EXECUTION & AUTO-RETRY
  ===================================================== */

  const dynamicModels = await getAvailableFlashModels();

  // Try the last successful model first, then the remaining candidates
  const modelsToTry = lastWorkingModel
    ? [lastWorkingModel, ...dynamicModels.filter((m) => m !== lastWorkingModel)]
    : dynamicModels;

  let attempt = 0;

  // We loop through the available models until one succeeds (both API & JSON parsing)
  while (attempt < modelsToTry.length) {
    const currentModel = modelsToTry[attempt];

    try {
      const response = await ai.models.generateContent({
        model: currentModel,
        contents: prompt,
        config: {
          temperature: config.temperature,
          maxOutputTokens: config.maxOutputTokens,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    priority: {
                      type: Type.STRING,
                      enum: ["low", "medium", "high"],
                    },
                    status: {
                      type: Type.STRING,
                      enum: ["todo"],
                    },
                  },
                  required: ["title", "description", "priority", "status"],
                },
              },
            },
            required: ["tasks"],
          },
        },
      });

      const text = response.text;

      if (!text) {
        throw new Error("EMPTY_RESPONSE");
      }

      // 1. Attempt to parse JSON inside the try block
      let parsed: unknown;
      try {
        const cleanText = text
          .replace(/^```(?:json)?\n?/i, "")
          .replace(/\n?```$/i, "")
          .trim();
        parsed = JSON.parse(cleanText);
      } catch {
        throw new Error("JSON_PARSE_ERROR");
      }

      // 2. Attempt Zod Validation inside the try block
      const validation = generatedTasksSchema.safeParse(parsed);
      if (!validation.success) {
        throw new Error("ZOD_VALIDATION_ERROR");
      }

      // SUCCESS! Remember the working model and return the data immediately
      if (lastWorkingModel !== currentModel) {
        lastWorkingModel = currentModel;
      }

      return validation.data;
    } catch (error: unknown) {
      attempt++;
      const errorDetails =
        typeof error === "object" && error !== null
          ? (error as { status?: string | number; message?: string })
          : {};

      // Identify if this is a network overload or a bad JSON hallucination
      const isApiOverload =
        errorDetails.status === 503 ||
        errorDetails.status === "UNAVAILABLE" ||
        errorDetails.message?.includes("high demand") ||
        errorDetails.status === 429;

      const isModelDeprecated =
        errorDetails.status === 404 || errorDetails.status === "NOT_FOUND";

      const isParsingError =
        errorDetails.message === "JSON_PARSE_ERROR" ||
        errorDetails.message === "ZOD_VALIDATION_ERROR" ||
        errorDetails.message === "EMPTY_RESPONSE";

      const isRecoverable =
        isApiOverload || isModelDeprecated || isParsingError;

      if (isRecoverable && attempt < modelsToTry.length) {
        // Only wait if it was a rate limit/overload. If it was just bad JSON, hit the next model instantly.
        if (isApiOverload) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
        }
      } else {
        // We ran out of models to try, or encountered a fatal error
        throw new Error(
          isRecoverable
            ? "Failed to generate valid tasks after multiple attempts. Please try again."
            : errorDetails.message ||
                "An unexpected error occurred with the AI service.",
          { cause: error },
        );
      }
    }
  }

  // Fallback catch (should not be reached due to the successful return inside the loop)
  throw new Error("Failed to generate tasks.");
}
