# Convex DB

## Tables

### `clients`

Core client record. Social intelligence is stored inline as an array — one entry per platform, updated in place by the daily cron.

```
_id                     auto

name                    string
age                     number
number                  string              -- WhatsApp number (E.164 e.g. "60123456789")
nationality             string
email                   string
occupation              string
income_range            string              -- e.g. "5000-10000"
website                 string | null
marital_status          "single" | "married" | "divorced" | "engaged"
no_of_dependents        number

existing_policies       array of:
  policy_id               string
  name                    string
  type                    string            -- "life" | "medical" | "investment-linked" | "critical-illness"
  start_date              string            -- ISO date
  end_date                string | null
  beneficiaries           string[]

financial_goals         array of string     -- "education_fund" | "retirement" | "housing" | freetext
sales_opportunities     string[]            -- advisor notes e.g. "Upgrade term to whole life"

social_intelligence     array of:
  platform                "linkedin" | "instagram" | "legacy"
  handle                  string | null     -- IG username or LinkedIn profile URL
  handle_confidence       "confirmed" | "auto" | "pending" | null
  last_checked            number | null     -- timestamp
  next_check              number | null     -- last_checked + 86400000 (24h in ms)
  data_found              array of:
    signal_type             string          -- see signal types below
    summary                 string          -- human-readable e.g. "Posted pregnancy announcement on 17 Jun"
    detected_at             number          -- timestamp
  pending_batch           boolean           -- true = signal found, not yet in a project

created_at              number
```

**Signal types**: `new_baby` `pregnancy` `marriage` `new_job` `promotion` `layoff` `retirement` `new_home` `family_death` `divorce`

---

### `messages`

WhatsApp conversation history for tracked clients only. Written by Baileys service in real-time. Used by backend LLM to synthesize context when advisor asks about a client.

```
_id             auto

client_id       reference → clients
from_me         boolean                   -- true = advisor sent, false = client sent
timestamp       number                    -- unix timestamp from WA (seconds)
text            string | null             -- null for media-only messages
type            "text" | "image" | "audio" | "video" | "other"

created_at      number
```

**Filter**: only messages where the sender/recipient phone number matches a client in the `clients` table are stored. Everything else is discarded at the Baileys layer.

---

### `projects`

Outreach campaigns. Auto-created by the weekly batch cron from social signals. Can also be created manually by the advisor.

```
_id             auto

name            string                    -- e.g. "Week of 22 Jun — Young Families"
sales_angle     string                    -- e.g. "Focus on dependent coverage for new parents"
created_at      number

clients         array of:
  client_id       reference → clients
  notes           string | null           -- e.g. "Pregnancy — pitch dependent coverage"
  status          "pending" | "contacted" | "responded" | "closed_won" | "closed_lost"
  outreached      boolean
```

---

## Key Queries

```ts
// Check if a phone number belongs to a tracked client (called by Baileys per message)
getClientByNumber(number: string) → client | null

// Get full client record including social_intelligence
getClientById(id: Id<"clients">) → client

// List all clients (for cron: find due for scan)
listClients() → client[]

// Get message history for a client (for LLM synthesis)
getMessagesByClient(clientId: Id<"clients">, limit?: number) → message[]

// Get current week's project
getCurrentProject() → project | null
```

## Key Mutations

```ts
// Written by backend when a new client is added
insertClient(data) → Id<"clients">

// Written by Baileys service on every tracked incoming message
insertMessage(data) → Id<"messages">

// Written by cron after each platform scan
upsertSocialIntelligence(clientId, platform, { handle, handle_confidence, last_checked, next_check, data_found, pending_batch })

// Written by weekly batch cron
insertProject(data) → Id<"projects">

// Written when advisor marks a client as outreached in dashboard
updateProjectClientStatus(projectId, clientId, status)
```
