from services import convex, llm


def handle_client_summary(advisor_message: str) -> str:
    # Try to extract a client name from the message
    clients = convex.list_clients() or []
    matched = None
    for c in clients:
        if convex.client_name(c).lower() in advisor_message.lower():
            matched = c
            break

    if not matched:
        return "I couldn't identify which client you're asking about. Please mention their name."

    history = convex.get_chat_history(matched["_id"]) or {}
    messages = history.get("messages", [])
    summary = llm.synthesize_client_context(matched, messages)
    return f"*{convex.client_name(matched)}*\n{summary}"


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
            matched = next(
                (c for c in clients if convex.client_name(c).lower() == client_name.lower()), None
            )
            if matched:
                convex.add_social(matched["_id"], platform, handle)
                return f"Updated {platform} handle for {convex.client_name(matched)} to {handle}."
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
