from fastapi import APIRouter, BackgroundTasks
from services import convex
from services.linkedin_scanner import scan_linkedin
from services.instagram_scanner import scan_instagram
from services.legacy_scanner import scan_legacy
from services.handle_resolution import resolve_handles
from services.batch_generator import generate_weekly_project

router = APIRouter(prefix="/workers", tags=["workers"])


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


@router.post("/scan-client/{client_id}")
def worker_scan_client(client_id: str, bg: BackgroundTasks):
    client = convex.get_client_by_id(client_id)
    if not client:
        from fastapi import HTTPException
        raise HTTPException(404, "Client not found")
    bg.add_task(scan_linkedin, client)
    bg.add_task(scan_instagram, client)
    bg.add_task(scan_legacy, client)
    return {"queued": 3, "client_id": client_id}


@router.post("/generate-batch")
def worker_generate_batch(bg: BackgroundTasks):
    bg.add_task(generate_weekly_project)
    return {"status": "queued"}
