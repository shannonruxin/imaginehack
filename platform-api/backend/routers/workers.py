from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from services import convex
from services.linkedin_scanner import scan_linkedin
from services.instagram_scanner import scan_instagram
from services.legacy_scanner import scan_legacy
from services.handle_resolution import resolve_handles
from services.batch_generator import (
    generate_weekly_project,
    generate_baby_maternity_project,
    generate_high_urgency_project,
    generate_custom_project,
)

router = APIRouter(prefix="/workers", tags=["workers"])


class CustomBatch(BaseModel):
    label: str = "Custom Batch"
    signals: list[str] = []
    persona_tags: list[str] = []
    platforms: list[str] = []
    marital_status: list[str] = []
    no_policies: bool = False
    missing_policy_types: list[str] = []
    only_recent: bool = False


def _get_all_clients() -> list[dict]:
    return convex.list_clients() or []


@router.post("/scan-linkedin")
def worker_scan_linkedin(bg: BackgroundTasks):
    clients = _get_all_clients()
    for client in clients:
        bg.add_task(scan_linkedin, client)
    return {"queued": len(clients)}


@router.post("/scan-instagram")
def worker_scan_instagram(bg: BackgroundTasks):
    clients = _get_all_clients()
    for client in clients:
        bg.add_task(scan_instagram, client)
    return {"queued": len(clients)}


@router.post("/scan-legacy")
def worker_scan_legacy(bg: BackgroundTasks):
    clients = _get_all_clients()
    for client in clients:
        bg.add_task(scan_legacy, client)
    return {"queued": len(clients)}


@router.post("/resolve-handles")
def worker_resolve_handles(bg: BackgroundTasks):
    clients = _get_all_clients()
    for client in clients:
        bg.add_task(resolve_handles, client)
    return {"queued": len(clients)}


def _resolve_then_scan(client_id: str) -> None:
    """Resolve missing handles first, then run all three scanners."""
    client = convex.get_client_by_id(client_id)
    if not client:
        return
    # Fill in any missing LinkedIn / Instagram handles via Exa search
    resolve_handles(client)
    # Re-fetch so scanners see the newly stored handles
    client = convex.get_client_by_id(client_id) or client
    scan_linkedin(client)
    scan_instagram(client)
    scan_legacy(client)


@router.post("/scan-client/{client_id}")
def worker_scan_client(client_id: str, bg: BackgroundTasks):
    client = convex.get_client_by_id(client_id)
    if not client:
        from fastapi import HTTPException
        raise HTTPException(404, "Client not found")
    bg.add_task(_resolve_then_scan, client_id)
    return {"queued": 1, "client_id": client_id}


@router.post("/generate-batch")
def worker_generate_batch(bg: BackgroundTasks):
    bg.add_task(generate_weekly_project)
    return {"status": "queued"}


@router.post("/generate-baby-maternity")
def worker_generate_baby_maternity(bg: BackgroundTasks):
    bg.add_task(generate_baby_maternity_project)
    return {"status": "queued"}


@router.post("/generate-high-urgency")
def worker_generate_high_urgency(bg: BackgroundTasks):
    bg.add_task(generate_high_urgency_project)
    return {"status": "queued"}


@router.post("/generate-custom")
def worker_generate_custom(body: CustomBatch, bg: BackgroundTasks):
    filters = body.model_dump(exclude={"label"})
    bg.add_task(generate_custom_project, filters, body.label)
    return {"status": "queued", "label": body.label}
