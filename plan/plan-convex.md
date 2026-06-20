# ImagineHack — To Do List

---

**1. Convex Setup**
- [ ] Initialize Convex project (`npm create convex@latest`)
- [ ] Write `schema.ts` — all 5 tables: `clients`, `signals`, `outreach_batches`, `projects`, `chat_history`
- [ ] Write Convex functions: `clients.ts`, `signals.ts`, `outreachBatches.ts`, `projects.ts`, `chatHistory.ts`
- [ ] Deploy to Convex cloud, grab `CONVEX_URL` + `CONVEX_DEPLOY_KEY`

**2. Python API Skeleton**
- [ ] Set up FastAPI project + APScheduler
- [ ] Stub all endpoints (return empty responses): `/clients`, `/signals`, `/outreach/batch`, `/workers/*`
- [ ] Wire up Convex Python client with `CONVEX_URL`

**3. Handle Resolution Worker**
- [ ] Exa search (3 parallel queries per client)
- [ ] LLM confidence scoring for Instagram handle candidates
- [ ] Auto-store HIGH confidence, flag MEDIUM to dashboard, prompt LOW manually
- [ ] Same logic for LinkedIn URL resolution
- [ ] Write resolved handle back to `clients.platforms`

**4. LinkedIn Scanner**
- [ ] Exa search by stored `linkedin_url`
- [ ] LLM signal classification → write detected signals to `signals` table
- [ ] Update `clients.platforms` scan schedule (`last_checked`, `next_check`)

**5. Instagram Scanner**
- [ ] Apify call by confirmed `instagram_handle`
- [ ] LLM signal classification on captions
- [ ] Vision LLM for posts with no caption (pregnancy/wedding photos)
- [ ] Write detected signals to `signals` table
- [ ] Update `clients.platforms` scan schedule

**6. Legacy.com Scanner**
- [ ] Exa search by client name + city + `known_family_members`
- [ ] LLM match check against known family members
- [ ] Write `family_death` signal to `signals` table
- [ ] Update `clients.platforms` scan schedule

**7. Batch Generator**
- [ ] Query `signals WHERE batched = false`
- [ ] Score urgency (HIGH: family_death, pregnancy, new_baby, marriage, new_home / MEDIUM: new_job, promotion, layoff, retirement, divorce)
- [ ] LLM generates `batch_sales_angle`
- [ ] Write to `outreach_batches`
- [ ] Mark included signals `batched = true`
- [ ] POST to `/internal/notify-advisor` → triggers OpenClaw WA message

**8. APScheduler Cron**
- [ ] Daily 03:00 AM → `scan_due_clients()`
- [ ] Monday 06:00 AM → `generate_outreach_batch()`

**9. OpenClaw Wiring**
- [ ] Cron schedule (resolve-handles 02:00, scan-linkedin 03:00, scan-instagram 03:30, scan-legacy 04:00, generate-batch Mon 06:00)
- [ ] Skill: `resolve_client_handle` — Exa search + score + ask advisor if MEDIUM
- [ ] Skill: `scan_client` — on-demand scan for one client
- [ ] Skill: `weekly_briefing` — surface current outreach batch
- [ ] Skill: `fetch_wa_chat_history` — load messages, write to `chat_history`
- [ ] Skill: `extract_followups` — LLM over chat log → reply with todos
- [ ] Skill: `surface_batch` — call `/outreach/batch/current` → format for WA
- [ ] Skill: `confirm_handle` — present candidate to advisor → write confirm/reject

**10. Environment Variables**
- [ ] `EXA_API_KEY`
- [ ] `APIFY_API_TOKEN`
- [ ] `CONVEX_URL` + `CONVEX_DEPLOY_KEY`
- [ ] `OPENAI_API_KEY` (or `ILMU_API_KEY`) + `LLM_MODEL`
