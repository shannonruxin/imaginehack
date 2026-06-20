from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services import llm
from services import advisor_llm
from services import convex

router = APIRouter(prefix="/advisor", tags=["advisor"])


class AdvisorMessage(BaseModel):
    message: str
    advisor_id: str = "default"


class SuggestAngle(BaseModel):
    client_id: str


@router.post("/message")
def advisor_message(body: AdvisorMessage):
    intent = llm.classify_intent(body.message)

    if intent == "client_summary":
        reply = advisor_llm.handle_client_summary(body.message)
    elif intent == "set_handle":
        reply = advisor_llm.handle_set_handle(body.message)
    elif intent == "weekly_batch":
        reply = advisor_llm.handle_weekly_batch(body.message)
    else:
        reply = advisor_llm.handle_freeform(body.message)

    return {"reply": reply, "intent": intent}


@router.post("/suggest-angle")
def suggest_angle(body: SuggestAngle):
    client = convex.get_client_by_id(body.client_id)
    if not client:
        raise HTTPException(404, "Client not found")
    history = convex.get_chat_history(body.client_id) or {}
    messages = history.get("messages", [])
    return llm.suggest_approach_angle(client, messages, client.get("recent_signals", []))
