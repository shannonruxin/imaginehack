from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services import convex

router = APIRouter(prefix="/internal", tags=["internal"])


class InboundMessage(BaseModel):
    phone_number: str
    body: str
    timestamp: str
    direction: str = "inbound"


@router.post("/messages")
def receive_message(body: InboundMessage):
    client = convex.get_client_by_number(body.phone_number)
    if not client:
        raise HTTPException(404, "Client not found")
    return convex.insert_message({
        "client_id": client["_id"],
        "phone_number": body.phone_number,
        "body": body.body,
        "timestamp": body.timestamp,
        "direction": body.direction,
    })
