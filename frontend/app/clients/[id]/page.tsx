"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getClient, getChatHistory, suggestAngle, scanClient, type Client, type Message, type RecentSignal } from "@/lib/api";

type Tab = "overview" | "chat";

const PLATFORM_LABEL: Record<string, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  legacy: "Legacy.com",
};

// Parse signal content (stored as JSON string) into something readable
function SignalContent({ signal }: { signal: RecentSignal }) {
  const [expanded, setExpanded] = useState(false);

  let parsed: unknown;
  try { parsed = JSON.parse(signal.content); } catch { parsed = null; }

  // Instagram: array of posts with caption/timestamp
  if (signal.platform === "instagram" && Array.isArray(parsed)) {
    const posts = parsed as { caption?: string; timestamp?: string; url?: string; likesCount?: number }[];
    return (
      <div className="space-y-3">
        {posts.map((p, i) => (
          <div key={i} className="rounded-md bg-muted/50 p-3 text-sm">
            <p className="text-muted-foreground text-xs mb-1">
              {p.timestamp ? new Date(p.timestamp).toLocaleDateString() : `Post ${i + 1}`}
              {p.likesCount ? ` · ${p.likesCount} likes` : ""}
            </p>
            <p>{p.caption || <span className="text-muted-foreground italic">No caption</span>}</p>
          </div>
        ))}
      </div>
    );
  }

  // LinkedIn / Legacy: Exa result — may be object with text/title or array of results
  if (parsed && typeof parsed === "object") {
    const results = Array.isArray(parsed) ? parsed : [parsed];
    const items = results as { title?: string; text?: string; url?: string; summary?: string }[];
    return (
      <div className="space-y-3">
        {items.slice(0, 3).map((item, i) => (
          <div key={i} className="rounded-md bg-muted/50 p-3 text-sm">
            {item.title && <p className="font-medium mb-1">{item.title}</p>}
            <p className="text-muted-foreground text-xs leading-relaxed whitespace-pre-wrap">
              {expanded
                ? (item.text || item.summary || "")
                : (item.text || item.summary || "").slice(0, 300) + ((item.text || item.summary || "").length > 300 ? "…" : "")}
            </p>
            {(item.text || item.summary || "").length > 300 && (
              <button onClick={() => setExpanded(e => !e)}
                className="text-xs text-primary mt-1 hover:underline">
                {expanded ? "Show less" : "Show more"}
              </button>
            )}
            {item.url && (
              <p className="text-xs text-muted-foreground mt-1 truncate">{item.url}</p>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Fallback: raw text, collapsible
  const raw = signal.content;
  return (
    <div className="text-xs text-muted-foreground rounded-md bg-muted/50 p-3 leading-relaxed whitespace-pre-wrap">
      {expanded ? raw : raw.slice(0, 400) + (raw.length > 400 ? "…" : "")}
      {raw.length > 400 && (
        <button onClick={() => setExpanded(e => !e)} className="block text-primary mt-1 hover:underline">
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [client, setClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [angle, setAngle] = useState<{ angle: string; reasoning: string } | null>(null);
  const [angleLoading, setAngleLoading] = useState(false);
  const [angleError, setAngleError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getClient(id), getChatHistory(id)])
      .then(([c, hist]) => {
        setClient(c);
        setMessages(hist.messages ?? []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleScan() {
    setScanning(true);
    setScanMsg(null);
    try {
      await scanClient(id);
      setScanMsg("Scan queued — signals update in the background.");
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
          <button onClick={handleScan} disabled={scanning}
            className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors">
            {scanning ? "Queuing…" : "↻ Fetch socials"}
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

          {/* Sales opportunities */}
          {client.sales_opportunities.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Sales opportunities</p>
              <div className="space-y-1">
                {client.sales_opportunities.map((o, i) => (
                  <div key={i} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-xs mt-0.5">{new Date(o.created_at).toLocaleDateString()}</span>
                    <span>{o.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent signals */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Recent signals
              {client.recent_signals.length > 0 && (
                <span className="ml-2 normal-case font-normal">
                  — {client.recent_signals.length} platform{client.recent_signals.length !== 1 ? "s" : ""}
                </span>
              )}
            </p>
            {client.recent_signals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No signals yet — hit &quot;Fetch socials&quot; to run a scan.</p>
            ) : (
              <div className="space-y-4">
                {client.recent_signals.map(s => (
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
                <div className="rounded-lg border p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Angle</p>
                  <p className="text-sm">{angle.angle}</p>
                </div>
                <div className="rounded-lg border p-4">
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
