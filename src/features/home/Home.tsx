import {
  Activity,
  ArrowRight,
  BarChart3,
  Check,
  CheckCheck,
  ChevronRight,
  CircleCheck,
  Command,
  FileCode2,
  FolderKanban,
  Layers3,
  LayoutDashboard,
  ListTodo,
  Search,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";
import { Link } from "react-router-dom";

const processSteps = [
  {
    number: "01",
    title: "Describe",
    copy: "Write your project idea and requirements in plain text or paste an existing RFC.",
    detail: "Freeform input →",
    icon: FileCode2,
  },
  {
    number: "02",
    title: "Generate",
    copy: "AI analyzes the description and creates a structured project plan with architecture notes.",
    detail: "Synthesis in ~2s →",
    icon: Sparkles,
  },
  {
    number: "03",
    title: "Execute",
    copy: "Track tasks and project progress in one place with unified specifications.",
    detail: "Full visibility →",
    icon: CheckCheck,
  },
];

const features = [
  {
    title: "AI Project Planning",
    copy: "Turn prompts and PRDs into technical specifications, dependency graphs, and database schemas.",
    icon: Workflow,
  },
  {
    title: "Project Management",
    copy: "Run teams aligned with real-time milestones, technical blockers, and high-resolution activity metrics.",
    icon: FolderKanban,
  },
  {
    title: "Task Management",
    copy: "Granular issue tracking, status decomposition, and full Markdown acceptance criteria.",
    icon: ListTodo,
  },
  {
    title: "Team Collaboration",
    copy: "Share architecture graphs, assign tasks, and comment directly on technical specs inline.",
    icon: Users,
  },
  {
    title: "Progress Tracking",
    copy: "Real-time completion rates, milestone burn-down, and automatic dependency health checks.",
    icon: Activity,
  },
  {
    title: "Search & Filtering",
    copy: "Instant keyboard-first navigation with deep search across all workspaces and specs.",
    icon: Search,
  },
];

const architecture = [
  ["01", "Authentication", "JWT, OAuth 2.0, Session Management", "Core"],
  ["02", "Product Management", "Catalog, Inventory, Search Index", "Catalog"],
  ["03", "Shopping Cart", "Session Store, Persistent Cart", "State"],
  ["04", "Payments", "Stripe Integration, Webhook Verification", "Billing"],
  [
    "05",
    "Orders",
    "Transactional State Machine, Email Notifications",
    "Events",
  ],
];

const tasks = [
  ["Set up project & CI/CD pipeline", "Done"],
  ["Create authentication system", "Done"],
  ["Build product management API", "In Progress"],
  ["Implement shopping cart store", "In Progress"],
  ["Integrate payments & webhooks", "Todo"],
  ["Create order management workflow", "Todo"],
];

function BrandMark() {
  return (
    <span className="flex size-7 items-center justify-center rounded-[5px] bg-[#161616] text-white">
      <BarChart3 aria-hidden="true" className="size-4" strokeWidth={2.2} />
    </span>
  );
}

function HeroPreview() {
  return (
    <div className="overflow-hidden rounded-[8px] border border-[#e7e2e6] bg-white shadow-[0_14px_35px_-22px_rgba(25,19,24,0.4)]">
      <div className="flex h-9 items-center justify-between border-b border-[#eee9ed] bg-[#f6f3f5] px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2 text-[10px] text-[#777078] sm:gap-3 sm:text-[11px]">
          <span className="flex shrink-0 gap-1.5" aria-hidden="true">
            <i className="size-1.5 rounded-full bg-[#c9c2c8]" />
            <i className="size-1.5 rounded-full bg-[#c9c2c8]" />
            <i className="size-1.5 rounded-full bg-[#c9c2c8]" />
          </span>
          <span className="truncate">
            CloudScale Architecture / API &amp; Microservices
          </span>
        </div>
        <span className="ml-2 flex shrink-0 items-center gap-1.5 rounded-full border border-[#e4dfe3] bg-white px-2 py-1 text-[8px] text-[#59545a] sm:text-[9px]">
          <i className="size-1.5 rounded-full bg-[#78977d]" />
          AI Synthesized
        </span>
      </div>

      <div className="grid gap-4 p-3 sm:grid-cols-2 sm:gap-5 sm:p-5">
        <section aria-label="Generated architecture">
          <div className="mb-2 flex items-center justify-between gap-2 text-[10px] font-semibold text-[#29252a] sm:text-[11px]">
            <span className="flex items-center gap-1.5">
              <Layers3 className="size-3" /> Core Architecture
            </span>
            <span className="text-[9px] font-normal text-[#918a91]">
              5 Nodes Verified
            </span>
          </div>
          <div className="space-y-1.5">
            {[
              [
                "01",
                "Auth Gateway",
                "OAuth 2.0 / JWT session validation",
                "Edge Node",
              ],
              [
                "02",
                "Event Ingestion",
                "Apache Kafka real-time stream",
                "Pub/Sub",
              ],
              [
                "03",
                "Postgres Worker",
                "Prisma ORM multi-tenant replicas",
                "Database",
              ],
              ["04", "Cache Layer", "Redis cluster state caching", "In-Memory"],
            ].map((row) => (
              <div
                key={row[0]}
                className="flex min-w-0 items-center justify-between gap-2 rounded-[4px] border border-[#eee9ed] px-2 py-1.5"
              >
                <div className="flex min-w-0 items-start gap-2">
                  <span className="pt-0.5 font-mono text-[8px] text-[#a29ba2]">
                    {row[0]}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[9px] font-medium text-[#373238]">
                      {row[1]}
                    </p>
                    <p className="truncate text-[8px] text-[#918a91]">
                      {row[2]}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-[8px] text-[#777078]">
                  {row[3]}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section aria-label="Generated sprint tasks">
          <div className="mb-2 flex items-center justify-between gap-2 text-[10px] font-semibold text-[#29252a] sm:text-[11px]">
            <span className="flex items-center gap-1.5">
              <ListTodo className="size-3" /> Generated Sprint
            </span>
            <span className="text-[9px] font-normal text-[#918a91]">
              6 Tasks Queued
            </span>
          </div>
          <div className="space-y-1.5">
            {[
              ["Provision AWS+GCP Subnets", "Done"],
              ["Schema migration baseline", "Done"],
              ["JWT token rotation & refresh", "In Progress"],
              ["Rate limiting with Redis token bucket", "Todo"],
              ["Telemetry & OpenTelemetry traces", "Todo"],
            ].map(([label, status]) => (
              <div
                key={label}
                className="flex min-w-0 items-center justify-between gap-2 rounded-[4px] border border-[#eee9ed] px-2 py-[7px]"
              >
                <span className="flex min-w-0 items-center gap-1.5 truncate text-[9px] text-[#454047]">
                  <CircleCheck className="size-3 shrink-0 text-[#9a929a]" />
                  {label}
                </span>
                <span
                  className={`shrink-0 rounded-[3px] px-1.5 py-0.5 text-[8px] ${status === "In Progress" ? "bg-[#171717] text-white" : "bg-[#f2eff1] text-[#777078]"}`}
                >
                  {status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function PlanningPreview() {
  return (
    <div className="rounded-[7px] border border-[#eee9ed] bg-[#f7f4f6] p-4 sm:p-6">
      <div className="rounded-[5px] border border-[#eee9ed] bg-white p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#8d858d]">
              Input prompt
            </p>
            <p className="mt-1 flex items-center gap-2 text-[10px] text-[#3c373d] sm:text-[11px]">
              <Command className="size-3" /> “Build an e-commerce platform”
            </p>
          </div>
          <span className="font-mono text-[8px] text-[#918a91]">
            Analyzed in 1.6s · Model: Architecture Engine v2
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-5 md:grid-cols-[1fr_1.15fr]">
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-[11px] font-semibold text-[#262227]">
              Generated Architecture
            </h3>
            <span className="font-mono text-[8px] text-[#918a91]">
              5 Components
            </span>
          </div>
          <div className="space-y-1.5">
            {architecture.map(([number, title, description, tag]) => (
              <div
                key={number}
                className="flex items-center justify-between gap-2 rounded-[4px] border border-[#eee9ed] bg-white px-2.5 py-2"
              >
                <div className="flex min-w-0 items-start gap-2">
                  <span className="font-mono text-[8px] text-[#938b93]">
                    {number}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[9px] font-medium text-[#343036]">
                      {title}
                    </p>
                    <p className="truncate font-mono text-[8px] text-[#918a91]">
                      {description}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-[8px] text-[#6b646b]">
                  {tag}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-[11px] font-semibold text-[#262227]">
              Actionable Tasks
            </h3>
            <span className="font-mono text-[8px] text-[#918a91]">6 Items</span>
          </div>
          <div className="space-y-1.5">
            {tasks.map(([label, status]) => (
              <div
                key={label}
                className="flex min-w-0 items-center justify-between gap-2 rounded-[4px] border border-[#eee9ed] bg-white px-2.5 py-2"
              >
                <span className="flex min-w-0 items-center gap-1.5 truncate text-[9px] text-[#39343a]">
                  {status === "Done" ? (
                    <Check className="size-3 shrink-0 text-[#6e8b72]" />
                  ) : (
                    <span className="size-1.5 shrink-0 rounded-full bg-[#aaa2aa]" />
                  )}
                  {label}
                </span>
                <span
                  className={`shrink-0 rounded-[3px] px-1.5 py-0.5 font-mono text-[8px] ${status === "In Progress" ? "bg-[#171717] text-white" : "bg-[#f2eff1] text-[#716a71]"}`}
                >
                  {status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

const Home = () => {
  return (
    <main className="min-h-screen bg-white text-[#171518]">
      <header className="sticky top-0 z-20 border-b border-[#eee9ed] bg-white/95 backdrop-blur">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex h-[58px] max-w-[1180px] items-center justify-between px-5 sm:px-8"
        >
          <Link
            to="/"
            className="flex items-center gap-2 text-[13px] font-semibold tracking-[-0.02em]"
          >
            <BrandMark /> Project Tasker
          </Link>
          <div className="hidden items-center gap-7 text-[11px] text-[#625c63] md:flex">
            <a className="transition hover:text-black" href="#features">
              Features
            </a>
            <a className="transition hover:text-black" href="#how-it-works">
              How It Works
            </a>
            <a className="transition hover:text-black" href="#planning">
              AI Planning
            </a>
            <a className="transition hover:text-black" href="#pricing">
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              className="px-2 py-2 text-[11px] text-[#4f4a50] transition hover:text-black"
              to="/login"
            >
              Log in
            </Link>
            <Link
              className="rounded-[4px] bg-[#171717] px-3 py-2 text-[10px] font-medium text-white transition hover:bg-[#393539]"
              to="/register"
            >
              Get started
            </Link>
            <Link
              aria-label="Open workspace"
              className="hidden size-7 items-center justify-center rounded-[4px] border border-[#e8e3e7] text-[#565058] transition hover:bg-[#f6f3f5] sm:flex"
              to="/app/dashboard"
            >
              <LayoutDashboard className="size-3.5" />
            </Link>
          </div>
        </nav>
      </header>

      <section className="px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-[72px]">
        <div className="mx-auto max-w-[920px] text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#eee9ed] bg-[#f7f4f6] px-3 py-1 text-[9px] text-[#625c63]">
            <Sparkles className="size-3" /> Project Tasker 2.0 · Software Planning
            Engine
          </span>
          <h1 className="mx-auto mt-5 max-w-[720px] text-[38px] font-semibold leading-[1.06] tracking-[-0.045em] sm:text-[54px]">
            Plan smarter. Build faster.
          </h1>
          <p className="mx-auto mt-3 max-w-[470px] text-[13px] leading-6 text-[#777078]">
            Turn your project ideas into structured architectures and actionable
            tasks with the help of AI.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              className="inline-flex h-10 items-center gap-2 rounded-[4px] bg-[#171717] px-4 text-[11px] font-medium text-white transition hover:bg-[#393539]"
              to="/register"
            >
              Start planning <ArrowRight className="size-3.5" />
            </Link>
            <a
              className="inline-flex h-10 items-center gap-1 rounded-[4px] px-3 text-[11px] text-[#4f4a50] transition hover:bg-[#f7f4f6]"
              href="#how-it-works"
            >
              See how it works <ChevronRight className="size-3.5" />
            </a>
          </div>
          <div className="mt-10 text-left sm:mt-12">
            <HeroPreview />
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-16 bg-[#f6f2f5] px-5 py-14 sm:px-8 sm:py-20"
      >
        <div className="mx-auto max-w-[920px]">
          <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-[#827982]">
            Process
          </p>
          <h2 className="mt-1 text-[27px] font-medium leading-tight tracking-[-0.035em] sm:text-[34px]">
            From idea to execution.
          </h2>
          <p className="mt-2 max-w-[530px] text-[12px] leading-5 text-[#777078]">
            Developers often have great project ideas but struggle to break them
            into clean system architecture and actionable tasks. 
            bridges the gap in seconds.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {processSteps.map(({ number, title, copy, detail, icon: Icon }) => (
              <article
                key={number}
                className="min-h-[190px] rounded-[5px] border border-[#eee9ed] bg-white p-5"
              >
                <span className="flex size-8 items-center justify-center rounded-[4px] bg-[#f1edf0] text-[#383239]">
                  <Icon className="size-4" />
                </span>
                <p className="mt-4 font-mono text-[8px] text-[#918a91]">
                  {number}
                </p>
                <h3 className="mt-1 text-[13px] font-medium">{title}</h3>
                <p className="mt-1.5 text-[10px] leading-[1.65] text-[#777078]">
                  {copy}
                </p>
                <p className="mt-4 font-mono text-[8px] text-[#514b52]">
                  {detail}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="planning"
        className="scroll-mt-16 px-5 py-14 sm:px-8 sm:py-20"
      >
        <div className="mx-auto max-w-[920px]">
          <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-[#827982]">
            Live capabilities
          </p>
          <h2 className="mt-1 text-[27px] font-medium leading-tight tracking-[-0.035em] sm:text-[34px]">
            Turn project descriptions into actionable plans.
          </h2>
          <p className="mt-2 max-w-[540px] text-[12px] leading-5 text-[#777078]">
            Give Project Tasker a project description. The AI analyzes the
            requirements and generates a structured architecture and actionable
            tasks.
          </p>
          <div className="mt-7">
            <PlanningPreview />
          </div>
        </div>
      </section>

      <section
        id="features"
        className="scroll-mt-16 bg-[#f6f2f5] px-5 py-14 sm:px-8 sm:py-20"
      >
        <div className="mx-auto max-w-[920px]">
          <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-[#827982]">
            Capabilities
          </p>
          <h2 className="mt-1 text-[27px] font-medium leading-tight tracking-[-0.035em] sm:text-[34px]">
            Everything you need to manage a project.
          </h2>
          <p className="mt-2 max-w-[520px] text-[12px] leading-5 text-[#777078]">
            A toolbox built for software engineers who value speed, spatial
            precision, and zero friction.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ title, copy, icon: Icon }) => (
              <article
                key={title}
                className="min-h-[146px] rounded-[5px] border border-[#eee9ed] bg-white p-5"
              >
                <span className="flex size-7 items-center justify-center rounded-[4px] bg-[#f1edf0] text-[#383239]">
                  <Icon className="size-3.5" />
                </span>
                <h3 className="mt-3 text-[11px] font-medium">{title}</h3>
                <p className="mt-1.5 text-[10px] leading-[1.6] text-[#777078]">
                  {copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-[920px]">
          <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-[#827982]">
            Workflow
          </p>
          <h2 className="mt-1 text-[27px] font-medium leading-tight tracking-[-0.035em] sm:text-[34px]">
            How It Works
          </h2>
          <p className="mt-2 text-[12px] leading-5 text-[#777078]">
            A predictable three-phase flow that takes you from ambiguity to
            clarity.
          </p>
          <div className="mt-8 grid gap-7 sm:grid-cols-3 sm:gap-5">
            {[
              [
                "01",
                "Create",
                "Describe your project and add collaborators. Set scope, constraints, and target deployment targets.",
              ],
              [
                "02",
                "Generate",
                "Project Tasker analyzes your requirements and automatically generates the complete project architecture and tasks.",
              ],
              [
                "03",
                "Execute",
                "Track progress, manage tasks, and collaborate with your team with live telemetry and progress sync.",
              ],
            ].map(([number, title, copy]) => (
              <article key={number}>
                <p className="text-[42px] font-medium leading-none tracking-[-0.05em] sm:text-[50px]">
                  {number}
                </p>
                <h3 className="mt-3 text-[12px] font-medium">{title}</h3>
                <p className="mt-1.5 max-w-[260px] text-[10px] leading-[1.65] text-[#777078]">
                  {copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="pricing"
        className="scroll-mt-16 px-5 pb-14 sm:px-8 sm:pb-20"
      >
        <div className="mx-auto flex max-w-[920px] flex-col items-center rounded-[8px] bg-[#171717] px-6 py-11 text-center text-white shadow-[0_14px_30px_-20px_rgba(20,16,18,0.5)] sm:py-14">
          <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#b5adb5]">
            Start building today
          </p>
          <h2 className="mt-2 max-w-[480px] text-[28px] font-medium leading-[1.1] tracking-[-0.035em] sm:text-[36px]">
            Your next project starts with an idea.
          </h2>
          <p className="mt-2 max-w-[390px] text-[11px] leading-5 text-[#c4bdc4]">
            Turn that idea into a structured plan with Project Tasker.
          </p>
          <Link
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-[4px] bg-white px-4 text-[10px] font-medium text-[#171717] transition hover:bg-[#eee9ed]"
            to="/register"
          >
            Get started <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#eee9ed] px-5 sm:px-8">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-5 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link to="/" className="text-[12px] font-semibold">
              Project Tasker
            </Link>
            <p className="mt-1 text-[9px] text-[#827982]">
              AI-powered project planning and task management.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-[9px] text-[#625c63]">
            <a className="hover:text-black" href="#features">
              Features
            </a>
            <a className="hover:text-black" href="#how-it-works">
              How it works
            </a>
            <a className="hover:text-black" href="#pricing">
              Pricing
            </a>
            <Link className="hover:text-black" to="/login">
              Log in
            </Link>
            <Link className="hover:text-black" to="/register">
              Sign up
            </Link>
          </div>
        </div>
        <div className="mx-auto flex max-w-[1180px] items-center justify-between border-t border-[#f0edf0] py-3 text-[8px] text-[#827982]">
          <span>© 2026 Project Tasker. All rights reserved.</span>
          <span className="flex items-center gap-1.5">
            System operational{" "}
            <i className="size-1.5 rounded-full bg-[#6d8c72]" />
          </span>
        </div>
      </footer>
    </main>
  );
};

export default Home;
