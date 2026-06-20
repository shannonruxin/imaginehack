from openai import OpenAI
from config import settings
import json

_client: OpenAI | None = None
_model = settings.LLM_MODEL


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(api_key=settings.OPENAI_API_KEY)
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


def suggest_approach_angle(client: dict, messages: list[dict], recent_signals: list[dict]) -> dict:
    system = (
        "You are a life insurance sales strategist. Given a client's recent WhatsApp "
        "conversation, their lifestyle persona, and their latest social signals, suggest "
        "the best way for the advisor to approach them. Reference prior conversation when "
        "relevant. Return JSON with keys: 'angle' (1-2 sentence approach) and 'reasoning' (why)."
    )
    persona = client.get("persona") or {}
    msg_text = "\n".join(
        f"{m.get('sender', '')}: {m.get('message', '')}" for m in messages[-20:]
    )
    si_text = "\n".join(
        f"[{e.get('platform', '')}] {e.get('content', '')[:800]}" for e in recent_signals
    )
    user = (
        f"Client: {_name(client)}\n"
        f"Persona: {persona.get('summary', 'unknown')} | Tags: {', '.join(persona.get('tags', []))}\n\n"
        f"Recent conversation:\n{msg_text or '(none)'}\n\n"
        f"Recent signals:\n{si_text or '(none)'}"
    )
    raw = _chat([{"role": "system", "content": system}, {"role": "user", "content": user}])
    data = json.loads(raw)
    return {"angle": data.get("angle", ""), "reasoning": data.get("reasoning", "")}


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
