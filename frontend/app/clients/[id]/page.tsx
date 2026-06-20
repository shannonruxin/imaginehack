"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getClient, getChatHistory, suggestAngle, type Client, type Message } from "@/lib/api";

type Tab = "overview" | "signals" | "chat" | "angle";

const PLATFORM_LABEL: Record<string, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  legacy: "Legacy.com",
};

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [client, setClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [angle, setAngle] = useState<{ angle: string; reasoning: string } | null>(null);
  const [angleLoading, setAngleLoading] = useState(false);
  const [angleError, setAngleError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getClient(id), getChatHistory(id)])
      .then(([c, hist]) => {
        setClient(c);
        setMessages(hist.messages ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function fetchAngle() {
    setAngleLoading(true);
    setAngleError(null);
    try {
      const result = await suggestAngle(id);
      setAngle(result);
    } catch (e: unknown) {
      setAngleError(e instanceof Error ? e.message : "Failed to get angle.");
    } finally {
      setAngleLoading(false);
    }
  }

  const tabClass = (t: Tab) =>
    `px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
      tab === t
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:text-foreground hover:bg-muted"
    }`;

  if (loading)
    return (
      <div>
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );

  if (error || !client)
    return (
      <div>
        <p className="text-sm text-red-500">{error ?? "Client not found."}</p>
        <Link href="/clients" className="text-sm text-muted-foreground hover:underline mt-2 block">
          ← Back to clients
        </Link>
      </div>
    );

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/clients" className="text-muted-foreground hover:text-foreground text-sm">
          ← Clients
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="text-2xl font-semibold">
          {client.first_name} {client.last_name}
        </h1>
      </div>

      <div className="flex gap-1 mb-6 border-b pb-3">
        {(["overview", "signals", "chat", "angle"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={tabClass(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {[
              ["Age", client.age],
              ["Nationality", client.nationality],
              ["Income", client.income_range],
              ["Marital status", client.marital_status],
              ["Phone", client.number],
              ["Email", client.email],
            ].map(([label, value]) => (
              <div key={label as string}>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
                <p className="text-sm font-medium mt-0.5">{value || "—"}</p>
              </div>
            ))}
          </div>

          {client.persona && (
            <div>
              <p className="text-sm font-medium mb-2">Persona</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {client.persona.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{client.persona.summary}</p>
            </div>
          )}

          {client.socials.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Social handles</p>
              <div className="space-y-1">
                {client.socials.map((s) => (
                  <div key={s.type} className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground w-20 capitalize">{s.type}</span>
                    <span>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {client.dependents.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Dependents</p>
              <div className="space-y-1">
                {client.dependents.map((d, i) => (
                  <div key={i} className="text-sm">
                    {d.first_name} {d.last_name}{" "}
                    <span className="text-muted-foreground">
                      ({d.relationship}{d.age ? `, ${d.age} yo` : ""})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {client.existing_policies.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Existing policies</p>
              <div className="space-y-2">
                {client.existing_policies.map((p) => (
                  <div key={p.policy_id} className="rounded-md border p-3 text-sm">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {p.type} · {p.start_date}
                      {p.end_date ? ` – ${p.end_date}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {client.sales_opportunities.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Sales opportunities</p>
              <div className="space-y-1">
                {client.sales_opportunities.map((o, i) => (
                  <div key={i} className="text-sm text-muted-foreground">
                    {o.description}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "signals" && (
        <div className="space-y-4">
          {client.recent_signals.length === 0 ? (
            <p className="text-muted-foreground text-sm">No signals yet. Run a scan to populate.</p>
          ) : (
            client.recent_signals.map((s) => (
              <div key={s.platform} className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{PLATFORM_LABEL[s.platform] ?? s.platform}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(s.date_fetched).toLocaleDateString()}
                  </span>
                </div>
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all max-h-64 overflow-y-auto">
                  {s.content}
                </pre>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "chat" && (
        <div className="space-y-3">
          {messages.length === 0 ? (
            <p className="text-muted-foreground text-sm">No chat history yet.</p>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.sender === "advisor" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-sm rounded-lg px-3 py-2 text-sm ${
                    m.sender === "advisor"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p>{m.message}</p>
                  <p className="text-xs opacity-60 mt-1 text-right">
                    {new Date(m.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "angle" && (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Ask the AI for a personalised conversation starter based on this client&apos;s signals
            and chat history.
          </p>
          <button
            onClick={fetchAngle}
            disabled={angleLoading}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors mb-4"
          >
            {angleLoading ? "Thinking…" : "Suggest approach angle"}
          </button>

          {angleError && <p className="text-sm text-red-500 mb-4">{angleError}</p>}

          {angle && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Suggested angle
                </p>
                <p className="text-sm">{angle.angle}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Reasoning
                </p>
                <p className="text-sm text-muted-foreground">{angle.reasoning}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
