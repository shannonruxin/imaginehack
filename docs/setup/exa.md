# Exa Setup

Exa lives entirely in the **platform-api backend**. OpenClaw does not call Exa.

---

## Todo

### 1. Get API Key
- [ ] Go to https://dashboard.exa.ai → API Keys → create a key

### 2. Add to env
- [x] `EXA_API_KEY=<your-key>` already in root `.env`
- [x] Copied to `platform-api/backend/.env`

### 3. Install deps
- [x] `pip install -r requirements.txt` — done (`exa-py==2.14.0` installed)

### 4. Smoke test
```bash
cd platform-api/backend
python3 -c "from services.exa import search_linkedin; print(search_linkedin('John Doe', 'AIA'))"
```

---

## What Exa does in this project

| Function | Used by | Purpose |
|----------|---------|---------|
| `search_linkedin` | `handle_resolution.py` | Find LinkedIn URL for a new client |
| `search_instagram` | `handle_resolution.py` | Find Instagram handle for a new client |
| `fetch_linkedin_profile` | `linkedin_scanner.py` | Daily profile fetch for change detection |
| `search_legacy` | `legacy_scanner.py` | Obituary search on Legacy.com |
