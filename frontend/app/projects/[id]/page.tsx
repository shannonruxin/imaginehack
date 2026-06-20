"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  getProject, getClients, updateProjectClient, enrichProject, suggestAngle, handoffToWhatsApp,
  type Project, type Client, type ProjectClient,
} from "@/lib/api";

type AngleResult = { angle_direct: string; angle_subtle: string; reasoning: string; web_enriched?: boolean };

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-MY", { weekday: "short", month: "short", day: "numeric" });
}

function relativeDate(ms: number) {
  const days = Math.round((Date.now() - ms) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.round(days / 30)}mo ago`;
  return `${Math.round(days / 365)}y ago`;
}

const STATUS_OPTIONS: ProjectClient["status"][] = [
  "to_follow_up", "meeting_scheduled", "stale", "followup_after_success",
];
const STATUS_LABEL: Record<ProjectClient["status"], string> = {
  to_follow_up: "To follow up",
  meeting_scheduled: "Meeting scheduled",
  stale: "Stale",
  followup_after_success: "Follow up after success",
};
const STATUS_COLOR: Record<ProjectClient["status"], string> = {
  to_follow_up: "bg-blue-100 text-blue-700",
  meeting_scheduled: "bg-yellow-100 text-yellow-700",
  stale: "bg-gray-100 text-gray-500",
  followup_after_success: "bg-green-100 text-green-700",
};

function ClientCard({
  entry, client, saving, selected, onStatus, onDates, onToggleSelect, onSetAngleType, onAngleFetched,
}: {
  entry: ProjectClient;
  client: Client | undefined;
  saving: boolean;
  selected: "direct" | "subtle" | null;
  onStatus: (status: ProjectClient["status"]) => void;
  onDates: (followUp: string, meeting: string) => Promise<void>;
  onToggleSelect: () => void;
  onSetAngleType: (t: "direct" | "subtle") => void;
  onAngleFetched: (a: AngleResult) => void;
}) {
  const [angle, setAngle] = useState<AngleResult | null>(null);
  const [loadingAngle, setLoadingAngle] = useState(false);
  const [showAngle, setShowAngle] = useState(false);
  const [editingDates, setEditingDates] = useState(false);
  const [followUp, setFollowUp] = useState(entry.next_follow_up_scheduled ?? "");
  const [meeting, setMeeting] = useState(entry.next_meeting_scheduled ?? "");

  const name = client ? `${client.first_name} ${client.last_name}` : entry.client_id;
  const policies = client?.existing_policies ?? [];
  const dependents = client?.dependents ?? [];
  const tags = client?.persona?.tags ?? [];
  const signals = client?.recent_signals ?? [];

  async function fetchAngle() {
    if (!client) return;
    setLoadingAngle(true);
    try {
      const res = await suggestAngle(entry.client_id);
      setAngle(res);
      setShowAngle(true);
      onAngleFetched(res);
    } catch {
      // ignore
    } finally {
      setLoadingAngle(false);
    }
  }

  async function saveDates() {
    await onDates(followUp, meeting);
    setEditingDates(false);
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-3">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-2">
            {client && (
              <input
                type="checkbox"
                checked={selected !== null}
                onChange={onToggleSelect}
                title="Select for WhatsApp handoff"
                className="shrink-0"
              />
            )}
            {client ? (
              <Link href={`/clients/${entry.client_id}`} className="font-medium text-sm hover:underline">
                {name}
              </Link>
            ) : (
              <span className="font-medium text-sm text-muted-foreground italic">Client no longer exists</span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_COLOR[entry.status]}`}>
              {STATUS_LABEL[entry.status]}
            </span>
            {tags.map(t => (
              <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t}</span>
            ))}
          </div>

          {/* Handoff angle choice (when selected) */}
          {selected !== null && (
            <div className="rounded-md bg-primary/5 border border-primary/20 p-3 space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Send via WhatsApp using:</span>
              {angle ? (
                <div className="space-y-2">
                  {(["subtle", "direct"] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => onSetAngleType(t)}
                      className={`w-full text-left rounded-md border p-2.5 transition-colors ${
                        selected === t
                          ? "border-primary bg-background ring-1 ring-primary"
                          : "border-border bg-background hover:bg-muted"
                      }`}
                    >
                      <span className="flex items-center gap-2 mb-1">
                        <span className={`h-3 w-3 rounded-full border shrink-0 ${
                          selected === t ? "bg-primary border-primary" : "border-muted-foreground"
                        }`} />
                        <span className="text-xs font-medium">
                          {t === "subtle" ? "Subtle catch-up" : "Straightforward"}
                        </span>
                        {t === "direct" && angle.web_enriched && (
                          <span className="text-[10px] px-1 py-0.5 rounded bg-primary/10 text-primary">web</span>
                        )}
                      </span>
                      <span className="block text-sm">
                        {t === "subtle" ? angle.angle_subtle : angle.angle_direct}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">Generate the angles to preview both options.</span>
                  <button
                    type="button"
                    onClick={fetchAngle}
                    disabled={loadingAngle}
                    className="text-xs px-2.5 py-1 rounded-full border hover:bg-muted disabled:opacity-40"
                  >
                    {loadingAngle ? "Thinking…" : "✦ Suggest angle"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Client snapshot */}
          {client && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>{client.age} yrs · {client.marital_status}</span>
              {client.income_range && <span>Income: {client.income_range}</span>}
              <span>{dependents.length} dependent{dependents.length !== 1 ? "s" : ""}</span>
              <span className={policies.length ? "" : "text-red-600 font-medium"}>
                {policies.length ? `${policies.length} active polic${policies.length !== 1 ? "ies" : "y"}` : "No active coverage"}
              </span>
            </div>
          )}

          {/* Coverage detail */}
          {policies.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {policies.map(p => (
                <span key={p.policy_id} className="text-xs px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-100">
                  {p.name || p.type}
                </span>
              ))}
            </div>
          )}

          {/* Recent signals */}
          {signals.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {signals.filter(s => s.platform !== "legacy").slice(0, 4).map((s, i) => (
                <span key={i} className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {s.platform} · {relativeDate(s.date_fetched)}
                </span>
              ))}
            </div>
          )}

          {/* Schedule */}
          {(entry.next_follow_up_scheduled || entry.next_meeting_scheduled) && !editingDates && (
            <div className="flex flex-wrap gap-2">
              {entry.next_follow_up_scheduled && (
                <span className="text-xs font-medium px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                  Follow-up: {fmtDate(entry.next_follow_up_scheduled)}
                </span>
              )}
              {entry.next_meeting_scheduled && (
                <span className="text-xs font-medium px-2 py-1 rounded-md bg-yellow-50 text-yellow-700 border border-yellow-100">
                  Meeting: {fmtDate(entry.next_meeting_scheduled)}
                </span>
              )}
            </div>
          )}

          {/* Approach angle (stored) */}
          {entry.notes && !angle && (
            <div className="rounded-md bg-muted/50 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Approach angle</p>
              <p className="text-sm">{entry.notes}</p>
            </div>
          )}

          {/* Fresh angle */}
          {angle && showAngle && (
            <div className="space-y-2">
              <div className="rounded-md bg-muted/50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide mb-1">Straightforward {angle.web_enriched && <span className="ml-1 text-[10px] px-1 py-0.5 rounded bg-primary/10 text-primary">web</span>}</p>
                <p className="text-sm">{angle.angle_direct}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs font-medium uppercase tracking-wide mb-1">Subtle catch-up</p>
                <p className="text-sm">{angle.angle_subtle}</p>
              </div>
              <div className="rounded-md bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">{angle.reasoning}</p>
              </div>
            </div>
          )}

          {/* Date editing */}
          {editingDates ? (
            <div className="flex flex-wrap gap-3 items-center">
              <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                Follow-up
                <input type="date" value={followUp} onChange={e => setFollowUp(e.target.value)}
                  className="border rounded px-2 py-1 text-xs bg-background" />
              </label>
              <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                Meeting
                <input type="date" value={meeting} onChange={e => setMeeting(e.target.value)}
                  className="border rounded px-2 py-1 text-xs bg-background" />
              </label>
              <button onClick={saveDates} disabled={saving}
                className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground disabled:opacity-50">Save</button>
              <button onClick={() => setEditingDates(false)} className="text-xs px-2 py-1 rounded border hover:bg-muted">Cancel</button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pt-1">
              {client && (
                <button onClick={fetchAngle} disabled={loadingAngle}
                  className="text-xs px-3 py-1.5 rounded-md border hover:bg-muted transition-colors disabled:opacity-40">
                  {loadingAngle ? "Thinking…" : angle ? "↻ Refresh angle" : "✦ Suggest angle"}
                </button>
              )}
              {angle && (
                <button onClick={() => setShowAngle(s => !s)} className="text-xs text-muted-foreground hover:text-foreground">
                  {showAngle ? "Hide" : "Show"}
                </button>
              )}
              <button onClick={() => setEditingDates(true)} className="text-xs underline text-muted-foreground hover:text-foreground ml-auto">
                {entry.next_follow_up_scheduled || entry.next_meeting_scheduled ? "Edit dates" : "Set dates"}
              </button>
            </div>
          )}
        </div>

        <select
          disabled={saving}
          value={entry.status}
          onChange={e => onStatus(e.target.value as ProjectClient["status"])}
          className="text-xs border rounded px-2 py-1 bg-background focus:outline-none shrink-0 disabled:opacity-40">
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
      </div>
    </div>
  );
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [clientMap, setClientMap] = useState<Record<string, Client>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [enriching, setEnriching] = useState(false);
  const [enrichMsg, setEnrichMsg] = useState<string | null>(null);
  // WhatsApp handoff
  const [selected, setSelected] = useState<Record<string, "direct" | "subtle">>({});
  const [angleCache, setAngleCache] = useState<Record<string, AngleResult>>({});
  const [handingOff, setHandingOff] = useState(false);
  const [handoffMsg, setHandoffMsg] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getProject(id), getClients()])
      .then(([proj, clients]) => {
        setProject(proj);
        const map: Record<string, Client> = {};
        for (const c of clients) map[c._id] = c;
        setClientMap(map);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleStatus(clientId: string, status: ProjectClient["status"]) {
    if (!project) return;
    setSaving(clientId);
    await updateProjectClient(id, clientId, { status }).catch(() => null);
    setProject(p => p ? { ...p, clients: p.clients.map(c => c.client_id === clientId ? { ...c, status } : c) } : p);
    setSaving(null);
  }

  async function saveDates(clientId: string, followUp: string, meeting: string) {
    if (!project) return;
    setSaving(clientId);
    await updateProjectClient(id, clientId, {
      next_follow_up_scheduled: followUp || undefined,
      next_meeting_scheduled: meeting || undefined,
    }).catch(() => null);
    setProject(p => p ? {
      ...p,
      clients: p.clients.map(c => c.client_id === clientId ? {
        ...c,
        next_follow_up_scheduled: followUp || undefined,
        next_meeting_scheduled: meeting || undefined,
      } : c),
    } : p);
    setSaving(null);
  }

  function toggleSelect(clientId: string) {
    setSelected(prev => {
      const next = { ...prev };
      if (clientId in next) delete next[clientId];
      else next[clientId] = "subtle";
      return next;
    });
  }

  function setAngleType(clientId: string, t: "direct" | "subtle") {
    setSelected(prev => ({ ...prev, [clientId]: t }));
  }

  async function runHandoff() {
    const ids = Object.keys(selected);
    if (!ids.length) return;
    setHandingOff(true);
    setHandoffMsg(null);
    let ok = 0;
    const failed: string[] = [];
    for (const clientId of ids) {
      const type = selected[clientId];
      const cached = angleCache[clientId];
      const message = cached ? (type === "direct" ? cached.angle_direct : cached.angle_subtle) : undefined;
      try {
        await handoffToWhatsApp(clientId, type, message);
        ok++;
      } catch {
        const c = clientMap[clientId];
        failed.push(c ? `${c.first_name} ${c.last_name}` : clientId);
      }
    }
    setHandingOff(false);
    setSelected({});
    setHandoffMsg(
      failed.length
        ? `Sent ${ok}. Failed: ${failed.join(", ")}.`
        : `Handed off ${ok} client${ok !== 1 ? "s" : ""} to WhatsApp.`
    );
  }

  async function handleEnrich() {
    setEnriching(true);
    setEnrichMsg(null);
    try {
      const result = await enrichProject(id) as { enriched: { client_id: string; angle: string }[] };
      const updated = result.enriched ?? [];
      setProject(p => p ? {
        ...p,
        clients: p.clients.map(c => {
          const match = updated.find(u => u.client_id === c.client_id);
          return match ? { ...c, notes: match.angle } : c;
        }),
      } : p);
      setEnrichMsg(`Enriched ${updated.length} client${updated.length !== 1 ? "s" : ""}.`);
    } catch {
      setEnrichMsg("Enrich failed — check that API keys are set.");
    } finally {
      setEnriching(false);
    }
  }

  if (loading) return <p className="text-muted-foreground">Loading…</p>;
  if (error || !project)
    return (
      <div>
        <p className="text-sm text-red-500">{error ?? "Project not found."}</p>
        <Link href="/projects" className="text-sm text-muted-foreground hover:underline mt-2 block">← Back</Link>
      </div>
    );

  const selectedCount = Object.keys(selected).length;
  const actioned = project.clients.filter(c => c.status !== "to_follow_up").length;
  const followUps = project.clients.filter(c => c.next_follow_up_scheduled).length;
  const meetings = project.clients.filter(c => c.next_meeting_scheduled).length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/projects" className="text-muted-foreground hover:text-foreground text-sm">← Projects</Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="text-2xl font-semibold">
          Batch — {new Date(project.created_at).toLocaleDateString("en-MY", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
        </h1>
      </div>

      {/* Batch angle */}
      <div className="rounded-lg border bg-muted/40 p-4 mb-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Batch angle</p>
        <p className="text-sm">{project.batch_sales_angle || "No angle."}</p>
      </div>

      {/* Progress bar */}
      <div className="rounded-lg border p-4 mb-6">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="font-medium">Progress</span>
          <span className="text-muted-foreground">{actioned} / {project.clients.length} actioned</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: project.clients.length ? `${(actioned / project.clients.length) * 100}%` : "0%" }}
          />
        </div>
        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
          <span>{followUps} follow-ups scheduled</span>
          <span>{meetings} meetings scheduled</span>
        </div>
      </div>

      {/* Enrich */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={handleEnrich} disabled={enriching}
          className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors">
          {enriching ? "Enriching…" : "✦ Enrich all angles"}
        </button>
        {enrichMsg && <p className="text-sm text-muted-foreground">{enrichMsg}</p>}
      </div>

      {/* Handoff bar */}
      {selectedCount > 0 && (
        <div className="sticky top-2 z-10 mb-4 flex flex-wrap items-center gap-3 rounded-lg border bg-primary/10 backdrop-blur px-4 py-3">
          <span className="text-sm font-medium">{selectedCount} selected for WhatsApp handoff</span>
          <button
            onClick={runHandoff}
            disabled={handingOff}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {handingOff ? "Sending…" : "Hand off to WhatsApp"}
          </button>
          <button onClick={() => setSelected({})} className="text-xs text-muted-foreground hover:text-foreground">
            Clear
          </button>
        </div>
      )}
      {handoffMsg && <p className="text-sm text-muted-foreground mb-3">{handoffMsg}</p>}

      {/* Client list */}
      <div className="space-y-3">
        {project.clients.map(entry => (
          <ClientCard
            key={entry.client_id}
            entry={entry}
            client={clientMap[entry.client_id]}
            saving={saving === entry.client_id}
            selected={selected[entry.client_id] ?? null}
            onStatus={s => handleStatus(entry.client_id, s)}
            onDates={(followUp, meeting) => saveDates(entry.client_id, followUp, meeting)}
            onToggleSelect={() => toggleSelect(entry.client_id)}
            onSetAngleType={t => setAngleType(entry.client_id, t)}
            onAngleFetched={a => setAngleCache(prev => ({ ...prev, [entry.client_id]: a }))}
          />
        ))}
      </div>
    </div>
  );
}
