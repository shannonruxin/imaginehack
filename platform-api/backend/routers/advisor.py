from fastapi import APIRouter
from pydantic import BaseModel
from services import llm
from services import advisor_llm

router = APIRouter(prefix="/advisor", tags=["advisor"])


class AdvisorMessage(BaseModel):
    message: str
    advisor_id: str = "default"


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
