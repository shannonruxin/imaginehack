# Cost Estimation — Per Advisor (400 Clients)

All figures are monthly recurring costs for one advisor managing 400 clients in production.

---

## Assumptions


| Parameter                   | Value     | Rationale                       |
| --------------------------- | --------- | ------------------------------- |
| Clients per advisor         | 400       | Problem statement               |
| LinkedIn handle coverage    | 70%       | Not all clients have LinkedIn   |
| Instagram handle coverage   | 60%       | Handle resolution success rate  |
| Avg dependents per client   | 2         | Drives Legacy.com search volume |
| Advisor queries to OpenClaw | 20 / day  | Light daily usage estimate      |
| New clients onboarded       | 5 / month | Steady-state growth             |


---

## 1. API Call Volume Analysis

### Exa API (daily cron at 3am)


| Search type                     | Calculation                               | Monthly volume          |
| ------------------------------- | ----------------------------------------- | ----------------------- |
| LinkedIn profile fetches        | 400 × 70% × 30 days                       | **8,400 calls**         |
| Legacy.com obituary searches    | 400 × (1 client + 2 dependents) × 30 days | **36,000 calls**        |
| Handle resolution (new clients) | 5 new clients × 6 Exa searches            | **30 calls**            |
| **Total Exa**                   |                                           | **~44,500 calls/month** |


### Apify API (daily cron at 3am)


| Task                             | Calculation               | Monthly volume   |
| -------------------------------- | ------------------------- | ---------------- |
| Instagram scraper runs           | 400 × 60% × 30 days       | **7,200 runs**   |
| Posts fetched                    | 7,200 runs × 3 posts each | **21,600 posts** |
| Compute units (est. 0.02 CU/run) | 7,200 × 0.02              | **144 CU**       |


### LLM Calls

#### gpt-4o-mini — Persona classification (daily, after each platform scan)


| Trigger                             | Calls/day   | Calls/month      |
| ----------------------------------- | ----------- | ---------------- |
| After LinkedIn scan (70% of 400)    | 280         | 8,400            |
| After Instagram scan (60% of 400)   | 240         | 7,200            |
| After Legacy.com scan (100% of 400) | 400         | 12,000           |
| **Total**                           | **920/day** | **27,600/month** |


Token estimate per call: ~1,500 input + 150 output

#### gpt-4o — Signal classification (weekly batch, Monday 6am)


| Trigger                                               | Calls/week    | Calls/month      |
| ----------------------------------------------------- | ------------- | ---------------- |
| classify_signals per client × platform (70% coverage) | 840           | 3,360            |
| generate_batch_angle (1 per week)                     | 1             | 4                |
| **Total**                                             | **~841/week** | **~3,364/month** |


Token estimate per `classify_signals` call: ~2,000 input + 300 output
Token estimate for `generate_batch_angle`: ~10,000 input + 2,000 output

#### gpt-4o — Advisor queries (on-demand)


| Function                                    | Calls/day | Calls/month | Tokens (in + out) |
| ------------------------------------------- | --------- | ----------- | ----------------- |
| `classify_intent`                           | 20        | 600         | 500 + 50          |
| `synthesize_client_context`                 | 10        | 300         | 3,000 + 500       |
| `suggest_approach_angle`                    | 5         | 150         | 3,000 + 500       |
| `score_handle_candidate` (new clients only) | ~0        | 30          | 500 + 50          |


#### Gemini 2.5 Flash — OpenClaw advisor interface


| Trigger                    | Calls/month | Tokens (in + out) |
| -------------------------- | ----------- | ----------------- |
| Advisor chat interactions  | 600         | 2,000 + 500       |
| Monday batch notifications | 4           | 1,000 + 300       |


---

## 2. Cost Breakdown

### Exa API

Exa charges approximately **$0.003 per search request** at scale (Teams plan ~$0.003/req, equivalent to ~$135/month for 45k requests). Official pricing may vary — check [exa.ai](https://exa.ai) for current rates.


| Line item                          | Volume       | Unit cost | Monthly cost |
| ---------------------------------- | ------------ | --------- | ------------ |
| LinkedIn fetches + Legacy searches | 44,500 calls | $0.003    | **$133**     |


### Apify

Apify Scale plan: **$99/month for 500 compute units**. Our estimated 144 CU fits comfortably.


| Plan  | Cost | CU included | CU needed |
| ----- | ---- | ----------- | --------- |
| Scale | $99  | 500 CU      | ~144 CU   |


Monthly cost: **$99**

### OpenAI — gpt-4o-mini (persona classification)

Pricing: $0.15/1M input tokens, $0.60/1M output tokens


|              | Calculation                            | Monthly cost |
| ------------ | -------------------------------------- | ------------ |
| Input        | 27,600 calls × 1,500 tokens × $0.15/1M | $6.21        |
| Output       | 27,600 calls × 150 tokens × $0.60/1M   | $2.48        |
| **Subtotal** |                                        | **$8.69**    |


### OpenAI — gpt-4o (signals, batch, advisor)

Pricing: $2.50/1M input tokens, $10.00/1M output tokens

**Signal classification (weekly batch):**


|              | Calculation                           | Monthly cost |
| ------------ | ------------------------------------- | ------------ |
| Input        | 3,360 calls × 2,000 tokens × $2.50/1M | $16.80       |
| Output       | 3,360 calls × 300 tokens × $10/1M     | $10.08       |
| **Subtotal** |                                       | **$26.88**   |


**Batch angle generation (weekly):**


|              | Calculation                        | Monthly cost |
| ------------ | ---------------------------------- | ------------ |
| Input        | 4 calls × 10,000 tokens × $2.50/1M | $0.10        |
| Output       | 4 calls × 2,000 tokens × $10/1M    | $0.08        |
| **Subtotal** |                                    | **$0.18**    |


**Advisor queries (on-demand):**


| Function                    | Calls/month | Input cost | Output cost | Subtotal  |
| --------------------------- | ----------- | ---------- | ----------- | --------- |
| `classify_intent`           | 600         | $0.75      | $0.30       | $1.05     |
| `synthesize_client_context` | 300         | $2.25      | $1.50       | $3.75     |
| `suggest_approach_angle`    | 150         | $1.13      | $0.75       | $1.88     |
| Handle resolution scoring   | 30          | $0.04      | $0.02       | $0.06     |
| **Subtotal**                |             |            |             | **$6.74** |


**gpt-4o total: $33.80/month**

### Gemini 2.5 Flash — OpenClaw

Pricing: ~$0.30/1M input, $2.50/1M output


|              | Calculation                         | Monthly cost |
| ------------ | ----------------------------------- | ------------ |
| Input        | 604 calls × 2,000 tokens × $0.30/1M | $0.36        |
| Output       | 604 calls × 500 tokens × $2.50/1M   | $0.76        |
| **Subtotal** |                                     | **$1.12**    |


### Convex DB

Convex Starter (free tier): 5M function calls/month, 10k documents, 1 GB storage.

Estimated monthly usage:

- Function calls: ~160,000 (scans + weekly batch + advisor queries)
- Documents: ~840 (400 clients + projects + chat histories)

**Well within free tier → $0/month**

### Server / Infrastructure

Always-on server required for Baileys WhatsApp session + APScheduler cron.

Recommended: Digital Ocean Droplet (2 vCPU, 4 GB RAM) or equivalent.

Monthly cost: **$20**

---

## 3. Summary Table


| Component              | Monthly Cost   | Notes                                            |
| ---------------------- | -------------- | ------------------------------------------------ |
| **Exa API**            | $133           | LinkedIn + Legacy.com daily scans                |
| **Apify**              | $99            | Instagram scraping, Scale plan                   |
| **OpenAI gpt-4o-mini** | $9             | Persona classification after each daily scan     |
| **OpenAI gpt-4o**      | $34            | Signal detection, batch generation, advisor chat |
| **Gemini 2.5 Flash**   | $1             | OpenClaw WhatsApp advisor interface              |
| **Convex DB**          | $0             | Within free tier                                 |
| **Infrastructure**     | $20            | VPS for always-on containers                     |
| **Total**              | **$296/month** |                                                  |


---

## 4. Per-Advisor and Per-Client Cost


| Metric                         | Value                       |
| ------------------------------ | --------------------------- |
| Total monthly cost per advisor | **~$296 / month**           |
| Total annual cost per advisor  | **~$3,552 / year**          |
| Cost per client per month      | **~$0.74 / client / month** |
| Cost per client per year       | **~$8.88 / client / year**  |


---

## 5. Cost Drivers and Optimisation Levers

**Biggest cost items:**

1. **Exa ($133)** — Legacy.com is the largest driver. Each client generates 3 searches/day (client name + avg 2 dependents). Reducing scan frequency to every 3 days for Legacy alone cuts this line by ~$88.
2. **Apify ($99)** — Plan cost is fixed at $99 even though only 144 of 500 CU are used. Room to absorb 3× the clients before needing the next tier.
3. **gpt-4o signal classification ($27)** — Only fires weekly. Token usage scales with the number of clients with recent social activity.

**Optimisation options:**


| Lever                                                   | Saving               | Trade-off                          |
| ------------------------------------------------------- | -------------------- | ---------------------------------- |
| Scan Legacy every 3 days instead of daily               | ~$88/month           | Slightly delayed death detection   |
| Use gpt-4o-mini for signal classification               | ~$25/month           | Lower accuracy on nuanced signals  |
| Only scan clients who have had recent WhatsApp activity | 20–30% LLM reduction | Miss silent signals                |
| Cap Instagram to 1 scan every 2 days                    | ~$40 Apify savings   | Less timely pregnancy/baby signals |


**Minimum viable cost** (Legacy 3× week, mini for signals, Instagram every 2 days):
~~$130/month per advisor, or **~~$0.33/client/month**

---

## 6. Scaling to Multiple Advisors

Most costs scale linearly per advisor. Only infrastructure is shared.


| Advisors | Exa     | Apify  | LLM    | Convex | Infra | **Total** | **Per advisor** |
| -------- | ------- | ------ | ------ | ------ | ----- | --------- | --------------- |
| 1        | $133    | $99    | $44    | $0     | $20   | $296      | $296            |
| 10       | $1,330  | $990   | $440   | $25    | $40   | $2,825    | $283            |
| 50       | $6,650  | $4,950 | $2,200 | $25    | $80   | $13,905   | $278            |
| 100      | $13,300 | $9,900 | $4,400 | $50    | $120  | $27,770   | $278            |


At 10+ advisors, Convex moves to the Pro plan ($25/month). Infrastructure can run multiple advisors on the same server up to ~20 advisors before needing to scale horizontally.

---

## 7. Revenue Break-Even Reference

For context: a single life insurance policy sale in Malaysia typically earns the advisor **RM 500–5,000+ in first-year commission** depending on the product.

At **$296/month (~RM 1,300/month)** operating cost, the system pays for itself with **1 additional policy sale per 3–6 months** — well within reach if even 1% of the 400 monitored clients converts due to timely outreach.

---

*Prices as of June 2026. Exa, Apify, and OpenAI pricing subject to change. Validate against current provider pricing pages before committing to production spend.*