# OpenClaw Setup

How to deploy the ImagineHack skill into the running OpenClaw container and wire it to the Python backend.

---

## Prerequisites

- [ ] `imaginehack-openclaw` container is running (`docker ps | grep openclaw`)
- [ ] `openclaw/plugin-skills/imaginehack/SKILL.md` exists in this repo
- [ ] `PLATFORM_API_URL` set in root `.env` (currently `http://backend:8000`)
- [ ] Python backend is reachable at that URL (see Component 13 below)

---

## 1. Deploy the Skill (rebuild container)

The skill is baked into the Docker image via `COPY openclaw/plugin-skills /opt/imaginehack/plugin-skills` and synced into `/root/.openclaw/plugin-skills/` by `entrypoint.sh` on every start.

```bash
cd /path/to/imaginehack

# Rebuild the image with the latest skill file
docker compose build openclaw

# Restart the container
docker compose up -d openclaw
```

Verify it landed:
```bash
docker exec imaginehack-openclaw cat /root/.openclaw/plugin-skills/imaginehack/SKILL.md | head -5
```

You should see the skill frontmatter. Done — no OpenClaw config changes needed.

---

## 2. Add the Backend Service (Component 13)

`PLATFORM_API_URL=http://backend:8000` resolves only if a service named `backend` is in the same docker network. Add it to `docker-compose.yml`:

```yaml
services:
  openclaw:
    # ... existing config ...
    depends_on:
      - backend

  backend:
    build: ./platform-api/backend
    image: imaginehack-backend
    container_name: imaginehack-backend
    env_file:
      - .env
    environment:
      - PORT=8000
    ports:
      - "8001:8000"   # expose on host port 8001 to avoid conflict with openclaw:8000
    restart: unless-stopped
```

Then:
```bash
docker compose up -d backend
docker compose restart openclaw   # so openclaw can resolve 'backend'
```

Smoke-test the backend is reachable from within openclaw:
```bash
docker exec imaginehack-openclaw curl -s http://backend:8000/health
```

---

## 3. Set Missing Env Vars

Before the backend can do anything useful:

```bash
# In root .env:
OPENAI_API_KEY=<your key>          # required for advisor LLM + classify_persona
CONVEX_DEPLOY_KEY=<your key>       # required for backend ↔ Convex; get from Convex dashboard
```

The backend won't start properly without `CONVEX_DEPLOY_KEY`.

---

## 4. Test the Full Flow

1. Text the advisor's WhatsApp number: `"What's up with Ahmad?"`
2. OpenClaw receives it, runs the `imaginehack` skill
3. Skill POSTs to `http://backend:8000/advisor/message`
4. Backend classifies → `client_summary` → queries Convex → LLM reply
5. OpenClaw sends the reply back on WhatsApp

**Manual curl test** (without WhatsApp, against a locally running backend):
```bash
curl -X POST http://localhost:8001/advisor/message \
  -H "Content-Type: application/json" \
  -d '{"message": "What is up with Ahmad?", "advisor_id": "default"}'
# → {"reply": "...", "intent": "client_summary"}
```

**Check skill logs** inside the container:
```bash
docker logs imaginehack-openclaw --tail 50
```

---

## 5. WhatsApp Allowlist

The WhatsApp account is in `dmPolicy: allowlist` — only numbers in `allowFrom` reach the skill. To add a number, update `openclaw.json` via OpenClaw's wizard or directly:

```bash
docker exec -it imaginehack-openclaw openclaw configure
```

Current allowlist (from `openclaw.json`): `60122468905`, `60173024851`.

---

## Troubleshooting

| Symptom | Check |
|---------|-------|
| Skill not found | Did you rebuild the image? `docker exec imaginehack-openclaw ls /root/.openclaw/plugin-skills/imaginehack/` |
| `Connection refused` to backend | Is `backend` service running? `docker ps \| grep backend` |
| `http://backend:8000` fails | Are openclaw + backend on the same docker-compose network? |
| Backend crashes on start | `CONVEX_DEPLOY_KEY` missing or `OPENAI_API_KEY` empty — check `.env` |
| No reply on WhatsApp | Is the advisor's number in the `allowFrom` list? |
| Backend returns 500 | Check `docker logs imaginehack-backend` for stack trace |
