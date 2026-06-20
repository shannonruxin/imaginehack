# ImagineHack Docs

## Overview docs
- [SPEC.md](../SPEC.md) — full system spec, DB schema, API endpoints, cron flows
- [PLAN.md](../PLAN.md) — build order, per-component task lists, current status

## Component docs
- [Architecture](components/architecture.md) — how all components connect
- [Convex DB](components/convex.md) — schema, queries, mutations
- [Python Backend](components/backend.md) — FastAPI structure, endpoints, cron
- [Baileys Service](components/baileys.md) — WhatsApp message streaming, how tracking works
- [Exa](components/exa.md) — handle resolution, LinkedIn + Legacy scanning
- [Apify](components/apify.md) — Instagram scanning
- [OpenClaw](components/openclaw.md) — container setup, skill wiring, WhatsApp interface
