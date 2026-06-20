import time
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

    sender = "client" if body.direction == "inbound" else "advisor"
    try:
        ts = int(body.timestamp)
    except (ValueError, TypeError):
        ts = int(time.time() * 1000)

    return convex.append_message(client["_id"], sender, body.body, ts)
