from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from pydantic import BaseModel
from services import convex
from services.handle_resolution import resolve_handles

router = APIRouter(prefix="/clients", tags=["clients"])


class ClientCreate(BaseModel):
    name: str
    phone_number: str
    company: str = ""
    city: str = ""
    known_family_members: list[str] = []
    linkedin_url: str = ""
    instagram_handle: str = ""


class ClientUpdate(BaseModel):
    name: str | None = None
    company: str | None = None
    city: str | None = None
    known_family_members: list[str] | None = None
    linkedin_url: str | None = None
    instagram_handle: str | None = None
    pending_batch: bool | None = None


@router.post("")
def create_client(body: ClientCreate, bg: BackgroundTasks):
    client = convex.insert_client(body.model_dump())
    if client:
        bg.add_task(resolve_handles, client)
    return client


@router.get("")
def list_clients():
    return convex.list_clients() or []


@router.get("/exists")
def client_exists(number: str = Query(...)):
    client = convex.get_client_by_number(number)
    return {"exists": client is not None, "client_id": client["_id"] if client else None}


@router.get("/{id}")
def get_client(id: str):
    client = convex.get_client_by_id(id)
    if not client:
        raise HTTPException(404, "Client not found")
    li = convex.get_social_intelligence(id, "linkedin")
    ig = convex.get_social_intelligence(id, "instagram")
    leg = convex.get_social_intelligence(id, "legacy")
    return {**client, "social_intelligence": {"linkedin": li, "instagram": ig, "legacy": leg}}


@router.patch("/{id}")
def update_client(id: str, body: ClientUpdate):
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(400, "No fields to update")
    return convex.update_client(id, updates)
