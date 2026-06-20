from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services import convex

router = APIRouter(prefix="/projects", tags=["projects"])


class ProjectCreate(BaseModel):
    name: str
    batch_sales_angle: str = ""
    client_ids: list[str] = []


class ClientStatusUpdate(BaseModel):
    status: str


@router.get("")
def list_projects():
    return convex.list_projects() or []


@router.post("")
def create_project(body: ProjectCreate):
    from datetime import datetime, timezone
    return convex.insert_project({
        **body.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "ready",
    })


@router.get("/{id}")
def get_project(id: str):
    project = convex.get_project(id)
    if not project:
        raise HTTPException(404, "Project not found")
    return project


@router.patch("/{project_id}/clients/{client_id}")
def update_client_status(project_id: str, client_id: str, body: ClientStatusUpdate):
    return convex.update_project_client_status(project_id, client_id, body.status)
