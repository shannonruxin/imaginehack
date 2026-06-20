import requests
from config import settings


def send_message(number: str, text: str) -> dict:
    """Send a WhatsApp message to a client via the baileys service."""
    resp = requests.post(
        f"{settings.BAILEYS_URL}/send",
        json={"number": number, "message": text},
        timeout=20,
    )
    resp.raise_for_status()
    return resp.json()
