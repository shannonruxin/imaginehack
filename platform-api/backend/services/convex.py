import httpx
from typing import Any
from config import settings

_base = settings.CONVEX_URL.rstrip("/")
_headers = {
    "Content-Type": "application/json",
    "Authorization": f"Convex {settings.CONVEX_DEPLOY_KEY}",
}


def _post(path: str, payload: dict) -> Any:
    resp = httpx.post(f"{_base}{path}", json=payload, headers=_headers, timeout=15)
    resp.raise_for_status()
    data = resp.json()
    if "status" in data and data["status"] == "error":
        raise RuntimeError(data.get("errorMessage", "Convex error"))
    return data.get("value")


def query(fn: str, args: dict = {}) -> Any:
    return _post("/api/query", {"path": fn, "args": args, "format": "json"})


def mutation(fn: str, args: dict = {}) -> Any:
    return _post("/api/mutation", {"path": fn, "args": args, "format": "json"})


# --- clients ---

def get_client_by_number(number: str):
    return query("clients:getByNumber", {"number": number})


def get_client_by_id(id: str):
    return query("clients:getById", {"id": id})


def list_clients():
    return query("clients:getAll", {})


def insert_client(data: dict):
    return mutation("clients:create", data)


def update_client(id: str, fields: dict):
    return mutation("clients:update", {"id": id, **fields})


def add_social(id: str, type: str, value: str):
    return mutation("clients:addSocial", {"id": id, "type": type, "value": value})


def add_dependent(id: str, relationship: str, first_name: str, last_name: str, age: int | None = None):
    args = {"id": id, "relationship": relationship, "first_name": first_name, "last_name": last_name}
    if age is not None:
        args["age"] = age
    return mutation("clients:addDependent", args)


def add_sales_opportunity(id: str, description: str):
    return mutation("clients:addSalesOpportunity", {"id": id, "description": description})


def append_social_intelligence(id: str, platform: str, content: str):
    return mutation("clients:appendSocialIntelligence", {
        "id": id, "platform": platform, "content": content,
    })


# --- chat history (OpenClaw conversation log) ---

def append_message(client_id: str, sender: str, message: str, timestamp: int):
    return mutation("chatHistory:appendMessage", {
        "client_id": client_id, "sender": sender, "message": message, "timestamp": timestamp,
    })


def get_chat_history(client_id: str):
    return query("chatHistory:getByClient", {"client_id": client_id})


# --- projects (weekly outreach todo list) ---

def list_projects():
    return query("projects:getAll", {})


def get_current_project():
    return query("projects:getCurrent", {})


def get_project(id: str):
    return query("projects:getById", {"id": id})


def insert_project(data: dict):
    return mutation("projects:create", data)


def update_project_client_status(
    id: str,
    client_id: str,
    status: str,
    notes: str | None = None,
    next_follow_up_scheduled: str | None = None,
    next_meeting_scheduled: str | None = None,
):
    args = {"id": id, "client_id": client_id, "status": status}
    if notes is not None:
        args["notes"] = notes
    if next_follow_up_scheduled is not None:
        args["next_follow_up_scheduled"] = next_follow_up_scheduled
    if next_meeting_scheduled is not None:
        args["next_meeting_scheduled"] = next_meeting_scheduled
    return mutation("projects:updateClientStatus", args)


# --- pure helpers over the client doc (no network) ---

def client_name(client: dict) -> str:
    return f"{client.get('first_name', '')} {client.get('last_name', '')}".strip()


def social_value(client: dict, type: str) -> str | None:
    for s in client.get("socials") or []:
        if s.get("type") == type:
            return s.get("value")
    return None


def latest_social_intelligence(client: dict, platform: str) -> dict | None:
    entries = [e for e in (client.get("social_intelligence") or []) if e.get("platform") == platform]
    if not entries:
        return None
    return max(entries, key=lambda e: e.get("date_fetched", 0))
