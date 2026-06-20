from typing import Literal
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services import convex, enrich as enrich_service

router = APIRouter(prefix="/projects", tags=["projects"])

ClientStatus = Literal["to_follow_up", "meeting_rescheduled", "stale", "help_me_out"]


class ProjectCreate(BaseModel):
    batch_sales_angle: str = ""
    clients: list[dict] = []


class ClientStatusUpdate(BaseModel):
    status: ClientStatus
    notes: str | None = None
    next_follow_up_scheduled: str | None = None
    next_meeting_scheduled: str | None = None


@router.get("")
def list_projects():
    return convex.list_projects() or []


@router.get("/current")
def current_project():
    return convex.get_current_project()


@router.post("")
def create_project(body: ProjectCreate):
    return convex.insert_project(body.model_dump())


@router.get("/{id}")
def get_project(id: str):
    project = convex.get_project(id)
    if not project:
        raise HTTPException(404, "Project not found")
    return project


@router.post("/{id}/enrich")
def enrich_project(id: str):
    project = convex.get_project(id)
    if not project:
        raise HTTPException(404, "Project not found")
    return {"enriched": enrich_service.enrich_project(id)}


@router.patch("/{project_id}/clients/{client_id}")
def update_client_status(project_id: str, client_id: str, body: ClientStatusUpdate):
    return convex.update_project_client_status(
        project_id,
        client_id,
        body.status,
        notes=body.notes,
        next_follow_up_scheduled=body.next_follow_up_scheduled,
        next_meeting_scheduled=body.next_meeting_scheduled,
    )
