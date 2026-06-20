from openai import OpenAI
from config import settings
import json

_client: OpenAI | None = None
_model = settings.LLM_MODEL


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(
            api_key=settings.GEMINI_API_KEY,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        )
    return _client


def _name(client: dict) -> str:
    return client.get("name") or f"{client.get('first_name', '')} {client.get('last_name', '')}".strip()


def _chat(messages: list[dict], response_format: str = "json") -> str:
    resp = _get_client().chat.completions.create(
        model=_model,
        messages=messages,
        response_format={"type": "json_object"} if response_format == "json" else None,
    )
    return resp.choices[0].message.content


LIFE_EVENT_SIGNALS = [
    "new_baby", "marriage", "divorce", "death_in_family", "new_job",
    "promotion", "job_loss", "retirement", "relocation", "new_home",
    "health_event", "graduation", "business_milestone",
]


def classify_signals(client: dict, platform: str, content: str) -> dict:
    system = (
        "You are a life insurance sales intelligence assistant. "
        "Analyze the social media content and identify life event signals that indicate "
        "a good time for an advisor to reach out. Return JSON with keys: "
        "'signals' (list of signal names from the provided list) and 'no_signal' (boolean)."
    )
    user = (
        f"Client: {_name(client)}\n"
        f"Platform: {platform}\n"
        f"Content:\n{content[:4000]}\n\n"
        f"Valid signals: {', '.join(LIFE_EVENT_SIGNALS)}"
    )
    raw = _chat([{"role": "system", "content": system}, {"role": "user", "content": user}])
    data = json.loads(raw)
    return {
        "signals": data.get("signals", []),
        "no_signal": data.get("no_signal", True),
    }


def classify_signals_vision(client: dict, image_url: str) -> dict:
    system = (
        "You are a life insurance sales intelligence assistant. "
        "Analyze this social media image and identify life event signals. "
        "Return JSON with keys: 'signals' (list) and 'no_signal' (boolean). "
        f"Valid signals: {', '.join(LIFE_EVENT_SIGNALS)}"
    )
    resp = _get_client().chat.completions.create(
        model=_model,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": [
                {"type": "text", "text": f"Client: {_name(client)}"},
                {"type": "image_url", "image_url": {"url": image_url}},
            ]},
        ],
    )
    data = json.loads(resp.choices[0].message.content)
    return {
        "signals": data.get("signals", []),
        "no_signal": data.get("no_signal", True),
    }


def score_handle_candidate(candidate_text: str, client: dict) -> int:
    system = (
        "You are helping verify if a social media profile belongs to a specific person. "
        "Score the match from 0-10 where 10 is definitely the same person. "
        "Return JSON with key 'score' (integer 0-10)."
    )
    user = (
        f"Person: {_name(client)}\n\n"
        f"Profile snippet:\n{candidate_text[:2000]}"
    )
    raw = _chat([{"role": "system", "content": system}, {"role": "user", "content": user}])
    data = json.loads(raw)
    return int(data.get("score", 0))


def synthesize_client_context(client: dict, messages: list[dict]) -> str:
    system = (
        "You are a briefing assistant for a life insurance advisor. "
        "Summarize the key context about this client based on recent WhatsApp messages. "
        "Be concise — focus on what the advisor needs to know before reaching out."
    )
    msg_text = "\n".join(
        f"[{m.get('timestamp', '')}] {m.get('sender', '')}: {m.get('message', '')}"
        for m in messages[-20:]
    )
    user = f"Client: {_name(client)}\nRecent messages:\n{msg_text}"
    resp = _get_client().chat.completions.create(
        model=_model,
        messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
    )
    return resp.choices[0].message.content


def generate_batch_angle(clients_and_signals: list[dict]) -> dict:
    system = (
        "You are a life insurance sales strategist. "
        "Given a list of clients and their detected life events, generate a weekly outreach batch. "
        "Return JSON with keys: 'name' (batch name), 'sales_angle' (1-2 sentence hook), "
        "'client_notes' (list of {client_id, note} per client)."
    )
    user = json.dumps(clients_and_signals, indent=2)
    raw = _chat([{"role": "system", "content": system}, {"role": "user", "content": user}])
    return json.loads(raw)


PERSONA_TAGS = [
    "family-oriented",
    "frequent-traveler",
    "luxury-lifestyle",
    "health-fitness",
    "career-driven",
    "entrepreneur",
    "religious-conservative",
    "young-professional",
    "outdoor-adventure",
    "foodie-lifestyle",
]


def classify_persona(client: dict, recent_signals: list[dict]) -> dict:
    """Cheap persona classification — runs after each scan, overwrites the stored persona."""
    system = (
        "You are a life insurance sales intelligence assistant. "
        "Based on the client's social media content, classify their lifestyle persona. "
        f"Choose 1–3 tags from: {', '.join(PERSONA_TAGS)}. "
        "Also write a one-sentence lifestyle summary useful for an advisor building rapport. "
        "Return JSON with keys: 'tags' (list of strings) and 'summary' (string)."
    )
    si_text = "\n\n".join(
        f"[{e.get('platform', '').upper()}]\n{e.get('content', '')[:1500]}"
        for e in recent_signals
    ) or "(no social content yet)"
    user = (
        f"Client: {_name(client)}, age {client.get('age', '?')}, "
        f"income range {client.get('income_range', '?')}\n\n"
        f"Social content:\n{si_text}"
    )
    try:
        resp = _get_client().chat.completions.create(
            model=settings.CLASSIFIER_MODEL,
            messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
            response_format={"type": "json_object"},
        )
        raw = resp.choices[0].message.content
        data = json.loads(raw)
        return {
            "tags": [t for t in data.get("tags", []) if t in PERSONA_TAGS],
            "summary": data.get("summary", ""),
        }
    except Exception:
        return {"tags": [], "summary": ""}


def _parse_signal_text(signal: dict) -> str:
    """Extract clean readable text from a signal's raw JSON content."""
    platform = signal.get("platform", "")
    try:
        parsed = json.loads(signal.get("content", "{}"))
    except Exception:
        return signal.get("content", "")[:600]

    if platform == "linkedin":
        return parsed.get("text", "")[:1500]

    if platform == "instagram":
        posts = parsed.get("posts", [])
        lines = []
        for p in posts[:5]:
            caption = (p.get("caption") or "").strip()
            ts = p.get("timestamp", "")
            if caption:
                lines.append(f"  [{ts[:10] if ts else ''}] {caption[:200]}")
        return "\n".join(lines) if lines else "(no captions)"

    # fallback
    results = parsed.get("results", [])
    if results:
        return "\n".join(f"  {r.get('title','')}: {r.get('text','')[:200]}" for r in results[:3])
    return str(parsed)[:600]


def suggest_approach_angle(client: dict, messages: list[dict], recent_signals: list[dict]) -> dict:
    persona = client.get("persona") or {}
    policies = client.get("existing_policies", [])
    dependents = client.get("dependents", [])
    opportunities = client.get("sales_opportunities", [])

    # Policy summary
    if policies:
        policy_lines = [f"  - {p.get('name','?')} ({p.get('type','?')})" for p in policies]
        policy_text = "\n".join(policy_lines)
    else:
        policy_text = "  None — no existing coverage on file"

    # Dependents
    dep_text = ", ".join(
        f"{d.get('relationship','?')} {d.get('first_name','')} (age {d.get('age','?')})"
        for d in dependents
    ) or "None"

    # Prior opportunities / notes
    opp_text = "\n".join(
        f"  [{o.get('created_at','')}] {o.get('description','')}"
        for o in opportunities[-5:]
    ) or "None"

    # Chat history — most recent 30 messages, labelled clearly
    msg_text = "\n".join(
        f"  {m.get('sender','?').upper()}: {m.get('message','')}"
        for m in messages[-30:]
    ) or "  (no WhatsApp history)"

    # Signals — parse each platform properly
    signal_parts = []
    for s in recent_signals:
        if s.get("platform") == "legacy":
            continue
        text = _parse_signal_text(s)
        if text.strip():
            signal_parts.append(f"[{s['platform'].upper()}]\n{text}")
    signal_text = "\n\n".join(signal_parts) or "  (none)"

    system = (
        "You are an experienced life insurance sales coach. Given everything known about this client, produce TWO versions of a conversation opener.\n\n"
        "STRAIGHTFORWARD: The advisor directly references something they saw or heard about the client online. "
        "Natural but transparent — like a friend who saw your post. E.g. 'Eh I saw you went Bali last month! How was it? Did you get travel insurance?' "
        "This works when the relationship is close enough that referencing their posts won't feel creepy.\n\n"
        "SUBTLE: This is just a warm, genuine catch-up message. No agenda, no hooks, no planted seeds. "
        "The goal is simply to re-open the relationship naturally — pick up from wherever the last WhatsApp conversation left off, "
        "be human, check in on something they mentioned before. The insurance topic will emerge on its own over the next few exchanges. "
        "Use the chat history to make it feel continuous and personal. If the conversation went cold, just say hey warmly. "
        "Do NOT try to steer towards any topic in this message — that comes later.\n\n"
        "Return JSON with keys:\n"
        "  'angle_direct': exact message for the straightforward approach — casual tone, feels like a friend\n"
        "  'angle_subtle': the warm catch-up opener — picks up from chat history, zero agenda visible\n"
        "  'reasoning': what signal you spotted, what insurance need it maps to, and how the subtle opener sets it up naturally over time"
    )

    user = (
        f"CLIENT PROFILE\n"
        f"  Name: {_name(client)}, Age: {client.get('age','?')}, "
        f"Marital: {client.get('marital_status','?')}, Income: {client.get('income_range','?')}\n"
        f"  Nationality: {client.get('nationality','?')}\n\n"
        f"DEPENDENTS\n  {dep_text}\n\n"
        f"EXISTING POLICIES\n{policy_text}\n\n"
        f"PERSONA\n  {persona.get('summary','unknown')}\n  Tags: {', '.join(persona.get('tags', []))}\n\n"
        f"WHATSAPP CONVERSATION HISTORY\n{msg_text}\n\n"
        f"RECENT SOCIAL SIGNALS\n{signal_text}\n\n"
        f"PRIOR SALES NOTES\n{opp_text}"
    )

    raw = _chat([{"role": "system", "content": system}, {"role": "user", "content": user}])
    data = json.loads(raw)
    return {
        "angle_direct": data.get("angle_direct", ""),
        "angle_subtle": data.get("angle_subtle", ""),
        "reasoning": data.get("reasoning", ""),
    }


def suggest_approach_angle_enriched(client: dict, messages: list[dict], recent_signals: list[dict]) -> dict:
    """Like suggest_approach_angle but layers a real web search on top when signals are specific enough."""
    import requests as _req

    base = suggest_approach_angle(client, messages, recent_signals)

    # Gate: extract a concrete searchable detail from signals via LLM
    si_text = "\n".join(
        f"[{e.get('platform', '')}] {e.get('content', '')[:800]}" for e in recent_signals
    )
    gate_system = (
        "You are screening social signals for a specific, concrete, searchable detail. "
        "Return JSON with keys: 'searchable' (boolean) and 'query' (string or null). "
        "Set searchable=true only if you can form a tight web search query — e.g. a named destination, "
        "specific hobby, recent life event with context. Generic signals like 'active on LinkedIn' or "
        "'family-oriented' must return searchable=false."
    )
    gate_user = f"Signals:\n{si_text or '(none)'}"
    gate_raw = _chat([{"role": "system", "content": gate_system}, {"role": "user", "content": gate_user}])
    gate = json.loads(gate_raw)

    web_context = ""
    if gate.get("searchable") and gate.get("query"):
        try:
            resp = _req.post(
                "https://api.exa.ai/search",
                headers={"x-api-key": settings.EXA_API_KEY, "Content-Type": "application/json"},
                json={"query": gate["query"], "numResults": 3, "useAutoprompt": True, "type": "neural"},
                timeout=10,
            )
            if resp.ok:
                results = resp.json().get("results", [])
                web_context = "\n\n".join(
                    f"- {r.get('title', '')}: {r.get('text', r.get('snippet', ''))[:400]}"
                    for r in results
                )
        except Exception:
            pass

    if not web_context:
        return {**base, "web_enriched": False}

    name = _name(client)
    compose_system = (
        "You are a life insurance sales coach. Using the base angles and extra web context, produce enriched versions of both openers. "
        "Return JSON with keys: 'angle_direct', 'angle_subtle', 'reasoning', 'web_enriched' (true). "
        "angle_direct: directly references something from their life (post, trip, event) — like a friend who saw it. "
        "angle_subtle: warm genuine catch-up that picks up from prior conversation — zero agenda, no planted seeds, just re-opening the relationship."
    )
    compose_user = (
        f"Client: {name}\n"
        f"Base direct angle: {base['angle_direct']}\n"
        f"Base subtle angle: {base['angle_subtle']}\n\n"
        f"Extra web context (weave in 1-2 specific facts to make it more concrete):\n{web_context}\n\n"
        "Enrich both openers with the web context. Keep the tone casual and personal."
    )
    raw = _chat([{"role": "system", "content": compose_system}, {"role": "user", "content": compose_user}])
    data = json.loads(raw)
    return {
        "angle_direct": data.get("angle_direct", base["angle_direct"]),
        "angle_subtle": data.get("angle_subtle", base["angle_subtle"]),
        "reasoning": data.get("reasoning", base["reasoning"]),
        "web_enriched": True,
        "search_query": gate["query"],
    }


def freeform_reply(message: str) -> str:
    system = "You are an AI assistant for a life insurance advisor. Answer concisely and helpfully."
    raw = _chat([{"role": "system", "content": system}, {"role": "user", "content": message}], response_format="text")
    return raw


def query_clients(query: str, clients: list[dict]) -> dict:
    """Natural language filter over the client list. Returns matching client IDs + explanation."""
    client_summaries = []
    for c in clients:
        persona = c.get("persona") or {}
        has_policies = len(c.get("existing_policies", [])) > 0
        signals = [s["platform"] for s in c.get("recent_signals", [])]
        client_summaries.append({
            "id": c["_id"],
            "name": f"{c.get('first_name', '')} {c.get('last_name', '')}".strip(),
            "age": c.get("age"),
            "marital_status": c.get("marital_status"),
            "income_range": c.get("income_range"),
            "persona_tags": persona.get("tags", []),
            "num_dependents": len(c.get("dependents", [])),
            "has_policies": has_policies,
            "signals": signals,
        })
    system = (
        "You are a data analyst for a life insurance advisor. "
        "Given a list of clients and a natural language query, return JSON with: "
        "'matching_ids': list of matching client _id strings, "
        "'explanation': one sentence explaining what you matched on. "
        "Be inclusive — if unsure, include the client."
    )
    user = f"Query: {query}\n\nClients:\n{json.dumps(client_summaries)}"
    raw = _chat([{"role": "system", "content": system}, {"role": "user", "content": user}])
    data = json.loads(raw)
    return {"matching_ids": data.get("matching_ids", []), "explanation": data.get("explanation", "")}


def classify_intent(advisor_message: str) -> str:
    system = (
        "Classify the advisor's message intent into exactly one of: "
        "client_summary, reminder, weekly_batch, set_handle, freeform. "
        "Return JSON with key 'intent'."
    )
    raw = _chat([
        {"role": "system", "content": system},
        {"role": "user", "content": advisor_message},
    ])
    data = json.loads(raw)
    return data.get("intent", "freeform")
