# Exa

## What we use it for

1. **Handle resolution** — find a client's LinkedIn URL and Instagram handle from their name + known info
2. **LinkedIn scanning** — fetch public LinkedIn profile page for signal detection
3. **Legacy.com scanning** — search obituaries for client's family members

## Why Exa

- 20,000 free requests/month — enough for all three use cases
- Indexes the open web including LinkedIn public pages and Legacy.com
- Returns full page text (`text: true`) not just snippets — needed for LLM signal detection
- `includeDomains` and `site:` filtering lets us target specific sources

## Free Tier

20,000 requests/month. No credit card required to start.

---

## Use Case 1 — Handle Resolution

Run when a client is added. Finds their LinkedIn URL and likely Instagram handle.

**Queries run in parallel:**
```python
exa.search(f'"{name}" {company} site:instagram.com', num_results=3, text=True)
exa.search(f'"{name}" "{city}" instagram',           num_results=3, text=True)
exa.search(f'"{name}" {company} site:linkedin.com',  num_results=3, text=True)
```

**LLM scoring per candidate:**
```
+3  bio/profile mentions client's company
+2  bio/profile mentions client's city
+2  display name matches client name closely
+1  industry keyword found in bio
+1  LinkedIn profile links to this Instagram account

≥ 6 → HIGH    → auto-store, begin monitoring
3–5 → MEDIUM  → flag for advisor confirmation on dashboard
< 3 → LOW     → prompt advisor to enter handle manually
```

---

## Use Case 2 — LinkedIn Scanning

Run daily for clients with a confirmed `linkedin_url`.

```python
results = exa.search(
    query=f'site:{client.linkedin_url}',
    num_results=1,
    text=True,          # full page text
    highlights=True     # LLM-extracted key phrases
)
page_text = results[0].text
```

Pass `page_text` to LLM signal detection prompt. LLM returns structured signals:
```json
{
  "signals": [{ "signal_type": "new_job", "summary": "...", "confidence": "high" }],
  "no_signal": false
}
```

---

## Use Case 3 — Legacy.com Scanning

Run daily for all clients. Uses known family member names if available.

```python
# With known family members
query = f'"{family_member_name}" obituary "{client.city}"'

# Without known family members (broader)
query = f'"{client.name}" family obituary "{client.city}"'

results = exa.search(
    query=query,
    num_results=5,
    include_domains=["legacy.com"],
    text=True
)
```

LLM checks if any result plausibly matches a client family member by name and recency.

---

## Limitations

- **LinkedIn**: only public profile data visible without login. Job history, connections, endorsements behind login wall are not accessible.
- **Instagram**: Exa does not index Instagram. Use Apify for Instagram.
- **Facebook**: not indexed by Exa.
- **Legacy.com quality**: improves significantly when `known_family_members[]` is populated on the client record. Prompt advisors to fill this in during onboarding.
- **People with low web presence**: Exa results for handle resolution may be sparse for clients who don't appear much online. Low confidence → advisor enters manually.

## API Reference

```python
from exa_py import Exa

exa = Exa(api_key=EXA_API_KEY)

results = exa.search(
    query,
    num_results=5,
    text=True,
    highlights=True,
    include_domains=["legacy.com"],   # optional domain filter
)

for r in results:
    print(r.url, r.text, r.highlights)
```
