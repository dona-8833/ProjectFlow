# ProjectTasker

ProjectTasker is a React and TypeScript project/task workspace. It uses React Router for navigation, Supabase for authentication and data, TanStack Query for server state, Zustand for the active auth session, and React Hook Form with Zod for validated forms.

## Documentation

Start with the [Application Logic Guide](docs/APP_LOGIC_GUIDE.md). It explains the route tree, providers, components, state ownership, Supabase services, project/task workflows, AI generation, and where to trace a behavior in code.

## Run locally

```bash
npm install
npm run dev
```

## Build and lint

```bash
npm run build
npm run lint
```

## Environment

The app needs these environment variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_GEMINI_API_KEY` for AI task generation

Use a local `.env.local` for development and do not commit real credentials. Vite variables prefixed with `VITE_` are included in browser code; never put service-role or other server secrets in them.
