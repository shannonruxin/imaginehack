"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getClient, getChatHistory, suggestAngle, scanClient, type Client, type Message, type RecentSignal } from "@/lib/api";

const POLL_INTERVAL = 8000; // ms between refreshes after scan

type Tab = "overview" | "chat";

const PLATFORM_LABEL: Record<string, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  legacy: "Legacy.com",
};

type ExaResult = { title?: string; url?: string; text?: string; highlights?: string[]; published_date?: string };
type IGPost = { caption?: string; timestamp?: string; url?: string; display_url?: string; likes_count?: number };

function TextBlock({ text, limit = 300 }: { text: string; limit?: number }) {
  const [expanded, setExpanded] = useState(false);
  const trimmed = text.trim();
  const needsTruncate = trimmed.length > limit;
  return (
    <div>
      <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
        {needsTruncate && !expanded ? trimmed.slice(0, limit) + "…" : trimmed}
      </p>
      {needsTruncate && (
        <button onClick={() => setExpanded(e => !e)} className="text-xs text-primary mt-1 hover:underline">
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

function SignalContent({ signal }: { signal: RecentSignal }) {
  let parsed: Record<string, unknown> | null = null;
  try { parsed = JSON.parse(signal.content); } catch { /* fallback below */ }

  if (!parsed) {
    return <TextBlock text={signal.content} limit={400} />;
  }

  // Instagram: { handle, posts: [{caption, timestamp, url, display_url, likes_count}] }
  if (signal.platform === "instagram") {
    const posts = (parsed.posts as IGPost[]) ?? [];
    if (posts.length === 0) return <p className="text-xs text-muted-foreground">No posts found.</p>;
    return (
      <div className="space-y-3">
        {posts.map((p, i) => (
          <div key={i} className={`rounded-md bg-muted/50 p-3 text-sm${p.url ? " cursor-pointer hover:bg-muted transition-colors" : ""}`} onClick={() => p.url && window.open(p.url, "_blank", "noopener,noreferrer")}>
            <p className="text-xs text-muted-foreground mb-1.5">
              {p.timestamp ? new Date(p.timestamp).toLocaleDateString("en-MY", { year: "numeric", month: "short", day: "numeric" }) : `Post ${i + 1}`}
              {p.likes_count === -1 ? " · likes hidden" : p.likes_count ? ` · ${p.likes_count.toLocaleString()} likes` : ""}
            </p>
            {p.caption
              ? <TextBlock text={p.caption} limit={250} />
              : <p className="text-xs text-muted-foreground italic">No caption</p>}
          </div>
        ))}
      </div>
    );
  }

  // LinkedIn: { url, text } OR { results: [ExaResult] }
  if (signal.platform === "linkedin") {
    const results: ExaResult[] = parsed.results
      ? (parsed.results as ExaResult[])
      : [{ url: parsed.url as string, text: parsed.text as string }];
    return (
      <div className="space-y-3">
        {results.map((r, i) => (
          <div key={i} className="rounded-md bg-muted/50 p-3 text-sm">
            {r.title && <p className="font-medium mb-1">{r.title}</p>}
            {r.published_date && <p className="text-xs text-muted-foreground mb-1">{r.published_date}</p>}
            {r.text && <TextBlock text={r.text} limit={400} />}
            {r.url && <p className="text-xs text-muted-foreground mt-1.5 truncate">{r.url}</p>}
          </div>
        ))}
      </div>
    );
  }

  // Legacy: { results: [ExaResult] }
  if (signal.platform === "legacy") {
    const results = (parsed.results as ExaResult[]) ?? [];
    if (results.length === 0) return <p className="text-xs text-muted-foreground">No results found.</p>;
    return (
      <div className="space-y-3">
        {results.map((r, i) => (
          <div key={i} className="rounded-md bg-muted/50 p-3 text-sm">
            {r.title && <p className="font-medium mb-1">{r.title}</p>}
            {r.text && <TextBlock text={r.text} limit={300} />}
            {r.highlights && r.highlights.length > 0 && (
              <ul className="mt-1.5 space-y-0.5">
                {r.highlights.map((h, j) => <li key={j} className="text-xs text-muted-foreground">· {h}</li>)}
              </ul>
            )}
            {r.url && <p className="text-xs text-muted-foreground mt-1.5 truncate">{r.url}</p>}
          </div>
        ))}
      </div>
    );
  }

  return <TextBlock text={signal.content} limit={400} />;
}

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [client, setClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [angle, setAngle] = useState<{ angle_direct: string; angle_subtle: string; reasoning: string; web_enriched?: boolean; search_query?: string } | null>(null);
  const [angleLoading, setAngleLoading] = useState(false);
  const [angleError, setAngleError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    Promise.all([getClient(id), getChatHistory(id)])
      .then(([c, hist]) => {
        setClient(c);
        setMessages(hist.messages ?? []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function refreshClient() {
    const updated = await getClient(id);
    setClient(updated);
  }

  async function handleScan() {
    setScanning(true);
    setScanMsg(null);
    try {
      await scanClient(id);
      setScanMsg("Scanning… refreshing signals automatically.");
      // Poll 4 times (every 8s) to pick up results as they come in
      setPolling(true);
      let count = 0;
      const interval = setInterval(async () => {
        count++;
        await refreshClient().catch(() => null);
        if (count >= 4) {
          clearInterval(interval);
          setPolling(false);
          setScanMsg("Scan complete — signals updated.");
        }
      }, POLL_INTERVAL);
    } catch {
      setScanMsg("Scan failed — check API keys.");
    } finally {
      setScanning(false);
    }
  }

  async function fetchAngle() {
    setAngleLoading(true);
    setAngleError(null);
    try {
      const result = await suggestAngle(id);
      setAngle(result);
    } catch (e: unknown) {
      setAngleError(e instanceof Error ? e.message : "Failed.");
    } finally {
      setAngleLoading(false);
    }
  }

  const tabClass = (t: Tab) =>
    `px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
      tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
    }`;

  if (loading) return <p className="text-muted-foreground">Loading…</p>;
  if (error || !client) return (
    <div>
      <p className="text-sm text-red-500">{error ?? "Client not found."}</p>
      <Link href="/clients" className="text-sm text-muted-foreground hover:underline mt-2 block">← Back</Link>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/clients" className="text-muted-foreground hover:text-foreground text-sm">← Clients</Link>
          <span className="text-muted-foreground">/</span>
          <h1 className="text-2xl font-semibold">{client.first_name} {client.last_name}</h1>
        </div>
        <div className="flex items-center gap-3">
          {scanMsg && <p className="text-xs text-muted-foreground">{scanMsg}</p>}
          <button onClick={handleScan} disabled={scanning || polling}
            className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors">
            {scanning ? "Queuing…" : polling ? "Refreshing…" : "↻ Fetch socials"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b pb-3">
        {(["overview", "chat"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={tabClass(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === "chat" && messages.length > 0 && (
              <span className="ml-1.5 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                {messages.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === "overview" && (
        <div className="space-y-8">

          {/* Demographics */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Profile</p>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {([
                ["Age", client.age],
                ["Nationality", client.nationality],
                ["Income", client.income_range],
                ["Marital status", client.marital_status],
                ["Phone", client.number],
                ["Email", client.email],
              ] as [string, string | number | undefined][]).map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-medium mt-0.5">{value || "—"}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Persona */}
          {client.persona && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Persona</p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {client.persona.tags.map(tag => (
                  <span key={tag} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{tag}</span>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{client.persona.summary}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Updated {new Date(client.persona.updated_at).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Social handles */}
          {client.socials.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Social handles</p>
              <div className="space-y-1">
                {client.socials.map(s => (
                  <div key={s.type} className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground w-20 capitalize">{s.type}</span>
                    <span className="font-medium">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dependents */}
          {client.dependents.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Dependents</p>
              <div className="space-y-1">
                {client.dependents.map((d, i) => (
                  <div key={i} className="text-sm">
                    {d.first_name} {d.last_name}
                    <span className="text-muted-foreground ml-1">
                      ({d.relationship}{d.age ? `, ${d.age} yo` : ""})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Existing policies */}
          {client.existing_policies.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Existing policies</p>
              <div className="space-y-2">
                {client.existing_policies.map(p => (
                  <div key={p.policy_id} className="rounded-md border p-3 text-sm">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {p.type} · {p.start_date}{p.end_date ? ` – ${p.end_date}` : ""}
                    </p>
                    {p.beneficiaries?.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Beneficiaries: {p.beneficiaries.map(b => `${b.first_name} ${b.last_name}`).join(", ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* Recent signals */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Recent signals
              {client.recent_signals.filter(s => s.platform !== "legacy").length > 0 && (
                <span className="ml-2 normal-case font-normal">
                  — {client.recent_signals.filter(s => s.platform !== "legacy").length} platform{client.recent_signals.filter(s => s.platform !== "legacy").length !== 1 ? "s" : ""}
                </span>
              )}
            </p>
            {client.recent_signals.filter(s => s.platform !== "legacy").length === 0 ? (
              <p className="text-sm text-muted-foreground">No signals yet — hit &quot;Fetch socials&quot; to run a scan.</p>
            ) : (
              <div className="space-y-4">
                {client.recent_signals.filter(s => s.platform !== "legacy").map(s => (
                  <div key={s.platform} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">{PLATFORM_LABEL[s.platform] ?? s.platform}</span>
                      <span className="text-xs text-muted-foreground">
                        Fetched {new Date(s.date_fetched).toLocaleDateString()}
                      </span>
                    </div>
                    <SignalContent signal={s} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Approach angle */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Approach angle</p>
            <p className="text-sm text-muted-foreground mb-3">
              AI-generated conversation starter based on this client&apos;s signals and chat history.
            </p>
            <button onClick={fetchAngle} disabled={angleLoading}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors mb-4">
              {angleLoading ? "Thinking…" : "Suggest approach angle"}
            </button>
            {angleError && <p className="text-sm text-red-500 mb-3">{angleError}</p>}
            {angle && (
              <div className="space-y-3">
                {angle.web_enriched && (
                  <p className="text-xs text-emerald-600 font-medium">
                    ✦ Web-enriched{angle.search_query ? ` · searched "${angle.search_query}"` : ""}
                  </p>
                )}
                <div className="rounded-lg border p-4">
                  <p className="text-xs font-medium uppercase tracking-wide mb-2">Straightforward</p>
                  <p className="text-xs text-muted-foreground mb-2">Reference something you saw — works when the relationship is close.</p>
                  <p className="text-sm">{angle.angle_direct}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs font-medium uppercase tracking-wide mb-2">Subtle</p>
                  <p className="text-xs text-muted-foreground mb-2">Warm catch-up that picks up from where you left off — no agenda, topic emerges naturally later.</p>
                  <p className="text-sm">{angle.angle_subtle}</p>
                </div>
                <div className="rounded-lg border p-4 bg-muted/40">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Reasoning</p>
                  <p className="text-sm text-muted-foreground">{angle.reasoning}</p>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Chat tab */}
      {tab === "chat" && (
        <div className="space-y-3 max-w-xl">
          {messages.length === 0 ? (
            <p className="text-muted-foreground text-sm">No chat history yet.</p>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`flex ${m.sender === "advisor" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-sm rounded-lg px-3 py-2 text-sm ${
                  m.sender === "advisor" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  <p>{m.message}</p>
                  <p className="text-xs opacity-60 mt-1 text-right">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
