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


# --- per-table helpers ---

def get_client_by_number(number: str):
    return query("clients:getByNumber", {"number": number})


def get_client_by_id(id: str):
    return query("clients:getById", {"id": id})


def list_clients():
    return query("clients:list", {})


def insert_message(data: dict):
    return mutation("messages:insert", data)


def upsert_social_intelligence(client_id: str, platform: str, data: dict):
    return mutation("socialIntelligence:upsert", {
        "clientId": client_id,
        "platform": platform,
        **data,
    })


def get_social_intelligence(client_id: str, platform: str):
    return query("socialIntelligence:get", {"clientId": client_id, "platform": platform})


def get_messages_by_client(client_id: str, limit: int = 50):
    return query("messages:listByClient", {"clientId": client_id, "limit": limit})


def insert_project(data: dict):
    return mutation("projects:insert", data)


def list_projects():
    return query("projects:list", {})


def get_project(id: str):
    return query("projects:getById", {"id": id})


def update_project_client_status(project_id: str, client_id: str, status: str):
    return mutation("projects:updateClientStatus", {
        "projectId": project_id,
        "clientId": client_id,
        "status": status,
    })


def insert_client(data: dict):
    return mutation("clients:insert", data)


def update_client(id: str, data: dict):
    return mutation("clients:update", {"id": id, **data})


def get_clients_pending_batch():
    return query("clients:listPendingBatch", {})


def set_clients_batch_done(client_ids: list[str]):
    return mutation("clients:setBatchDone", {"clientIds": client_ids})
