from services import convex, llm


def handle_client_summary(advisor_message: str) -> str:
    # Try to extract a client name from the message
    clients = convex.list_clients() or []
    matched = None
    for c in clients:
        if c.get("name", "").lower() in advisor_message.lower():
            matched = c
            break

    if not matched:
        return "I couldn't identify which client you're asking about. Please mention their name."

    messages = convex.get_messages_by_client(matched["_id"]) or []
    summary = llm.synthesize_client_context(matched, messages)
    return f"*{matched['name']}*\n{summary}"


def handle_set_handle(advisor_message: str) -> str:
    # Expected: "set instagram handle for John Doe to @johndoe"
    import re
    clients = convex.list_clients() or []

    for platform in ["instagram", "linkedin"]:
        pattern = rf"set {platform}.*?for (.+?) to @?(\S+)"
        m = re.search(pattern, advisor_message, re.IGNORECASE)
        if m:
            client_name = m.group(1).strip()
            handle = m.group(2).strip().lstrip("@")
            matched = next((c for c in clients if c.get("name", "").lower() == client_name.lower()), None)
            if matched:
                field = "instagram_handle" if platform == "instagram" else "linkedin_url"
                convex.update_client(matched["_id"], {field: handle})
                return f"Updated {platform} handle for {matched['name']} to {handle}."
            return f"Couldn't find client '{client_name}'."

    return "I couldn't parse the handle update. Try: 'set instagram handle for John Doe to @johndoe'"


def handle_weekly_batch(advisor_message: str) -> str:
    from services.batch_generator import generate_weekly_project
    generate_weekly_project()
    return "Generating this week's outreach batch — I'll send you a summary when it's ready."


def handle_freeform(advisor_message: str) -> str:
    from openai import OpenAI
    from config import settings
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    resp = client.chat.completions.create(
        model=settings.LLM_MODEL,
        messages=[
            {"role": "system", "content": (
                "You are an AI assistant for a life insurance advisor. "
                "Answer questions concisely and helpfully."
            )},
            {"role": "user", "content": advisor_message},
        ],
    )
    return resp.choices[0].message.content
