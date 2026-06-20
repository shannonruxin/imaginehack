"""Live Exa fetch test — uses the real services.exa wrappers, NO database writes.

Run from repo root:
    python3 test/exa_test.py

Writes raw responses to test/output/exa_*.json and prints a summary.
"""
import os
import sys
import json

# Make the backend package importable and chdir so config.py finds ../../.env
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND = os.path.join(ROOT, "platform-api", "backend")
sys.path.insert(0, BACKEND)
os.chdir(BACKEND)

# Exa doesn't touch Convex; satisfy config.Settings without a real Convex key.
os.environ.setdefault("CONVEX_DEPLOY_KEY", "test-unused")

from services import exa  # noqa: E402

OUT = os.path.join(ROOT, "test", "output")

# Target person. Override via CLI: python3 test/exa_test.py "Shannon Choo" [company] [city]
NAME = sys.argv[1] if len(sys.argv) > 1 else "Tony Fernandes"
COMPANY = sys.argv[2] if len(sys.argv) > 2 else ""
CITY = sys.argv[3] if len(sys.argv) > 3 else ""


def dump(label, data):
    path = os.path.join(OUT, f"exa_{label}.json")
    with open(path, "w") as f:
        json.dump(data, f, indent=2, default=str)
    print(f"  -> saved {len(data) if isinstance(data, list) else 1} result(s) to {path}")


def preview(results, n=2):
    for r in results[:n]:
        title = (r.get("title") or "")[:80]
        url = r.get("url") or ""
        text = (r.get("text") or "")[:160].replace("\n", " ")
        print(f"    • {title}\n      {url}\n      {text}...")


def step(label, fn):
    """Run one fetch, record success/failure, never crash the whole run."""
    try:
        data = fn()
        if isinstance(data, list):
            preview(data)
        dump(label, data)
        return data
    except Exception as e:
        print(f"    !! FAILED: {type(e).__name__}: {e}")
        dump(label, {"error": f"{type(e).__name__}: {e}"})
        return None


def main():
    print(f"\n=== EXA LIVE TEST (target: {NAME}, {COMPANY}, {CITY}) ===\n")

    print("[1] exa.search_linkedin()")
    li = step("search_linkedin", lambda: exa.search_linkedin(NAME, COMPANY, CITY))

    print("\n[2] exa.search_instagram()")
    step("search_instagram", lambda: exa.search_instagram(NAME, COMPANY, CITY))

    print("\n[3] exa.search_legacy() (obituary search, legacy.com only)")
    step("search_legacy", lambda: exa.search_legacy(NAME, CITY, []))

    print("\n[4] exa.fetch_linkedin_profile() on first linkedin hit")
    if li:
        step("fetch_linkedin_profile", lambda: exa.fetch_linkedin_profile(li[0]["url"]))
    else:
        print("    (no linkedin hits to fetch)")

    print("\n=== DONE ===")


if __name__ == "__main__":
    main()
