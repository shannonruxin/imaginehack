import concurrent.futures
from apscheduler.schedulers.background import BackgroundScheduler
from services import convex
from services.linkedin_scanner import scan_linkedin
from services.instagram_scanner import scan_instagram
from services.legacy_scanner import scan_legacy
from services.batch_generator import generate_weekly_project

scheduler = BackgroundScheduler()


def scan_due_clients() -> None:
    clients = convex.list_clients() or []
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
        for client in clients:
            pool.submit(scan_linkedin, client)
            pool.submit(scan_instagram, client)
            pool.submit(scan_legacy, client)


scheduler.add_job(scan_due_clients,        "cron", hour=3,  minute=0)
scheduler.add_job(generate_weekly_project, "cron", day_of_week="mon", hour=6, minute=0)
