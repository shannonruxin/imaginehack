from openai import OpenAI
from config import settings
import json

_client = OpenAI(api_key=settings.OPENAI_API_KEY)
_model = settings.LLM_MODEL


def _chat(messages: list[dict], response_format: str = "json") -> str:
    resp = _client.chat.completions.create(
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
        f"Client: {client.get('name')}, {client.get('city', '')}\n"
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
    resp = _client.chat.completions.create(
        model=_model,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": [
                {"type": "text", "text": f"Client: {client.get('name')}, {client.get('city', '')}"},
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
        f"Person: {client.get('name')}, works at {client.get('company', 'unknown')}, "
        f"lives in {client.get('city', 'unknown')}\n\n"
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
        f"[{m.get('timestamp', '')}] {m.get('direction', '')}: {m.get('body', '')}"
        for m in messages[-20:]
    )
    user = f"Client: {client.get('name')}\nRecent messages:\n{msg_text}"
    resp = _client.chat.completions.create(
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
