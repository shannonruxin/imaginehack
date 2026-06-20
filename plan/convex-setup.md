# Convex Setup Plan

## Goal
Initialize Convex as the shared database for the ImagineHack project. The Python backend and OpenClaw both read/write to Convex — getting the schema right is the foundation everything else builds on.

---

## Step 1 — Initialize Convex in the project

```bash
npm create convex@latest
# or if adding to existing project:
npx convex dev --once
```

This creates:
- `convex/` directory
- `convex/_generated/` (auto-generated, do not edit)
- `convex/schema.ts`
- `.env.local` with `CONVEX_URL`

---

## Step 2 — Write the schema

File: `convex/schema.ts`

### Table: `clients`

```ts
clients: defineTable({
  // Core info
  name: v.string(),
  age: v.number(),
  number: v.string(),
  nationality: v.string(),
  email: v.string(),
  occupation: v.string(),
  income_range: v.string(),
  website: v.optional(v.string()),

  // Personal profile
  marital_status: v.union(
    v.literal("single"),
    v.literal("married"),
    v.literal("divorced"),
    v.literal("engaged")
  ),
  no_of_dependents: v.number(),

  // Insurance
  existing_policies: v.array(v.object({
    policy_id: v.string(),
    name: v.string(),
    type: v.string(),
    start_date: v.string(),
    end_date: v.optional(v.string()),
    beneficiaries: v.array(v.string()),
  })),

  // Goals & opportunities
  financial_goals: v.array(v.string()),
  sales_opportunities: v.array(v.string()),

  // Social intelligence (one entry per platform)
  social_intelligence: v.array(v.object({
    platform: v.union(
      v.literal("linkedin"),
      v.literal("instagram"),
      v.literal("legacy")
    ),
    handle: v.optional(v.string()),
    handle_confidence: v.optional(v.union(
      v.literal("confirmed"),
      v.literal("auto"),
      v.literal("pending")
    )),
    last_checked: v.optional(v.number()),
    next_check: v.optional(v.number()),
    data_found: v.array(v.object({
      signal_type: v.string(),
      summary: v.string(),
      detected_at: v.number(),
    })),
    pending_batch: v.boolean(),
  })),

  created_at: v.number(),
})
```

### Table: `projects`

```ts
projects: defineTable({
  name: v.string(),
  sales_angle: v.string(),
  created_at: v.number(),

  clients: v.array(v.object({
    client_id: v.id("clients"),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("contacted"),
      v.literal("responded"),
      v.literal("closed_won"),
      v.literal("closed_lost")
    ),
    outreached: v.boolean(),
  })),
}),

  interactions: defineTable({

    // Which client this interaction belongs to
    client_id: v.id("clients"),

    // Optional: link it to a sales project/campaign
    project_id: v.optional(v.id("projects")),

    // Communication type
    type: v.union(
      v.literal("call"),
      v.literal("meeting"),
      v.literal("email"),
      v.literal("whatsapp")
    ),

    // Date of interaction
    date: v.number(),

    // What happened
    notes: v.string(),

    // When advisor should contact again
    next_follow_up: v.optional(v.number())

  })

  .index("by_client", ["client_id"])

  .index("by_follow_up", ["next_follow_up"]),
```

---

## Step 3 — Add indexes for query performance

Add these indexes to `clients` so the Python backend can query efficiently:

```ts
.index("by_created_at", ["created_at"])
.index("by_name", ["name"])
```

The daily scan queries `social_intelligence` for clients whose `next_check` is due — this is a nested field, so the backend will fetch all clients and filter in Python (acceptable at hackathon scale).

---

## Step 4 — Write Convex query/mutation functions

Create these files under `convex/`:

| File | What it exposes |
|---|---|
| `convex/clients.ts` | `getAll`, `getById`, `create`, `update` |
| `convex/projects.ts` | `getAll`, `getById`, `create`, `updateClientStatus` |
| `convex/socialIntelligence.ts` | `updatePlatformData`, `getPendingBatch`, `clearPendingBatch` |

The Python backend calls these via the [Convex HTTP client](https://docs.convex.dev/client/python).

---

## Step 5 — Deploy to Convex cloud

```bash
npx convex deploy
```

This gives you:
- A live `CONVEX_URL` (e.g. `https://happy-animal-123.convex.cloud`)
- A `CONVEX_DEPLOY_KEY` for the Python backend

Add both to your `.env`:

```
CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOY_KEY=prod:your-deploy-key
```

---

## Step 6 — Verify with Convex dashboard

Open `https://dashboard.convex.dev` → confirm:
- Both tables (`clients`, `projects`) appear
- Schema matches the spec
- Run a test mutation to insert a dummy client

---

## File structure after setup

```
imaginehack/
├── convex/
│   ├── schema.ts
│   ├── clients.ts
│   ├── projects.ts
│   ├── socialIntelligence.ts
│   └── _generated/       ← auto-generated, do not edit
├── .env.local            ← CONVEX_URL (local dev)
└── package.json
```

---

## Environment variables needed

```
CONVEX_URL=               # from dashboard, used by Python backend
CONVEX_DEPLOY_KEY=        # for CI/deploy
```

---

## Notes

- Convex runs TypeScript only — schema and functions must be `.ts`
- The Python backend uses the [convex PyPI package](https://pypi.org/project/convex/) to call these functions over HTTP
- `social_intelligence` is stored as an array on the client record (not a separate table) — keeps queries simple at hackathon scale
- `_generated/` is rebuilt automatically on every `npx convex dev` run — never edit it manually
