"""Live Apify Instagram fetch test — uses the real services.apify wrapper, NO database writes.

Run from repo root:
    python3 test/apify_test.py [instagram_handle]

Default handle is a large public account. The Apify actor run consumes credits and
can take 30-90s. Writes raw posts to test/output/apify_instagram.json.
"""
import os
import sys
import json
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND = os.path.join(ROOT, "platform-api", "backend")
sys.path.insert(0, BACKEND)
os.chdir(BACKEND)

# Apify doesn't touch Convex; satisfy config.Settings without a real Convex key.
os.environ.setdefault("CONVEX_DEPLOY_KEY", "test-unused")

from services import apify  # noqa: E402

OUT = os.path.join(ROOT, "test", "output")

HANDLE = sys.argv[1] if len(sys.argv) > 1 else "natgeo"


def main():
    print(f"\n=== APIFY LIVE TEST (handle: @{HANDLE}) ===\n")
    print("Calling apify.run_instagram_scraper() — this hits the live Apify actor...")
    t0 = time.time()
    posts = apify.run_instagram_scraper(HANDLE, results_limit=3)
    dt = time.time() - t0
    print(f"Actor run finished in {dt:.1f}s — {len(posts)} post(s) returned\n")

    for p in posts[:3]:
        cap = (p.get("caption") or "")[:120].replace("\n", " ")
        print(f"  • {p.get('url')}")
        print(f"    likes={p.get('likes_count')}  ts={p.get('timestamp')}")
        print(f"    caption: {cap}...")

    path = os.path.join(OUT, "apify_instagram.json")
    with open(path, "w") as f:
        json.dump(posts, f, indent=2, default=str)
    print(f"\n  -> saved {len(posts)} post(s) to {path}")
    print("\n=== DONE ===")


if __name__ == "__main__":
    main()
