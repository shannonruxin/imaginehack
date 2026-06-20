from typing import Literal
from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from pydantic import BaseModel
from services import convex
from services.handle_resolution import resolve_handles

router = APIRouter(prefix="/clients", tags=["clients"])

MaritalStatus = Literal["single", "married", "divorced", "engaged"]


class ClientCreate(BaseModel):
    first_name: str
    last_name: str
    age: int
    nationality: str
    income_range: str
    number: str
    email: str
    marital_status: MaritalStatus
    dependents: list[dict] = []
    existing_policies: list[dict] = []
    socials: list[dict] = []
    sales_opportunities: list[dict] = []


class ClientUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    age: int | None = None
    nationality: str | None = None
    income_range: str | None = None
    number: str | None = None
    email: str | None = None
    marital_status: MaritalStatus | None = None


class OpportunityCreate(BaseModel):
    description: str


@router.post("")
def create_client(body: ClientCreate, bg: BackgroundTasks):
    client_id = convex.insert_client(body.model_dump())
    client = convex.get_client_by_id(client_id) if client_id else None
    if client:
        bg.add_task(resolve_handles, client)
    return client


@router.get("")
def list_clients():
    return convex.list_clients() or []


@router.get("/exists")
def client_exists(number: str = Query(...)):
    client = convex.get_client_by_number(number)
    if not client and not number.startswith("+"):
        client = convex.get_client_by_number("+" + number)
    return {"exists": client is not None, "client_id": client["_id"] if client else None}


@router.get("/{id}")
def get_client(id: str):
    client = convex.get_client_by_id(id)
    if not client:
        raise HTTPException(404, "Client not found")
    return client


@router.patch("/{id}")
def update_client(id: str, body: ClientUpdate):
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(400, "No fields to update")
    return convex.update_client(id, updates)


@router.post("/{id}/opportunities")
def add_opportunity(id: str, body: OpportunityCreate):
    return convex.add_sales_opportunity(id, body.description)


@router.get("/{id}/chat-history")
def chat_history(id: str):
    history = convex.get_chat_history(id) or {}
    return {"client_id": id, "messages": history.get("messages", [])}
