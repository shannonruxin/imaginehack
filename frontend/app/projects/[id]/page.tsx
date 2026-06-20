"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  getProject, getClients, updateProjectClient, enrichProject,
  type Project, type Client, type ProjectClient,
} from "@/lib/api";

const STATUS_OPTIONS: ProjectClient["status"][] = [
  "to_follow_up", "meeting_rescheduled", "stale", "help_me_out",
];
const STATUS_LABEL: Record<ProjectClient["status"], string> = {
  to_follow_up: "Follow up",
  meeting_rescheduled: "Rescheduled",
  stale: "Stale",
  help_me_out: "Help me out",
};
const STATUS_COLOR: Record<ProjectClient["status"], string> = {
  to_follow_up: "bg-blue-100 text-blue-700",
  meeting_rescheduled: "bg-yellow-100 text-yellow-700",
  stale: "bg-gray-100 text-gray-500",
  help_me_out: "bg-red-100 text-red-700",
};

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [clientMap, setClientMap] = useState<Record<string, Client>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [enriching, setEnriching] = useState(false);
  const [enrichMsg, setEnrichMsg] = useState<string | null>(null);
  // per-row date editing
  const [editingDates, setEditingDates] = useState<string | null>(null);
  const [dateValues, setDateValues] = useState<{ follow_up: string; meeting: string }>({ follow_up: "", meeting: "" });

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

  function openDateEdit(entry: ProjectClient) {
    setEditingDates(entry.client_id);
    setDateValues({
      follow_up: entry.next_follow_up_scheduled ?? "",
      meeting: entry.next_meeting_scheduled ?? "",
    });
  }

  async function saveDates(clientId: string) {
    if (!project) return;
    setSaving(clientId);
    await updateProjectClient(id, clientId, {
      next_follow_up_scheduled: dateValues.follow_up || undefined,
      next_meeting_scheduled: dateValues.meeting || undefined,
    }).catch(() => null);
    setProject(p => p ? {
      ...p,
      clients: p.clients.map(c => c.client_id === clientId ? {
        ...c,
        next_follow_up_scheduled: dateValues.follow_up || undefined,
        next_meeting_scheduled: dateValues.meeting || undefined,
      } : c),
    } : p);
    setSaving(null);
    setEditingDates(null);
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

  const actioned = project.clients.filter(c => c.status === "stale" || c.status === "meeting_rescheduled").length;
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

      {/* Client list */}
      <div className="space-y-2">
        {project.clients.map(entry => {
          const client = clientMap[entry.client_id];
          const name = client ? `${client.first_name} ${client.last_name}` : entry.client_id;
          const isEditingDates = editingDates === entry.client_id;

          return (
            <div key={entry.client_id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Link href={`/clients/${entry.client_id}`} className="font-medium text-sm hover:underline">
                      {name}
                    </Link>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_COLOR[entry.status]}`}>
                      {STATUS_LABEL[entry.status]}
                    </span>
                  </div>
                  {entry.notes && <p className="text-sm text-muted-foreground mb-2">{entry.notes}</p>}

                  {isEditingDates ? (
                    <div className="flex flex-wrap gap-3 mt-2">
                      <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                        Follow-up
                        <input type="date" value={dateValues.follow_up}
                          onChange={e => setDateValues(v => ({ ...v, follow_up: e.target.value }))}
                          className="border rounded px-2 py-1 text-xs bg-background" />
                      </label>
                      <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                        Meeting
                        <input type="date" value={dateValues.meeting}
                          onChange={e => setDateValues(v => ({ ...v, meeting: e.target.value }))}
                          className="border rounded px-2 py-1 text-xs bg-background" />
                      </label>
                      <button onClick={() => saveDates(entry.client_id)} disabled={saving === entry.client_id}
                        className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground disabled:opacity-50">
                        Save
                      </button>
                      <button onClick={() => setEditingDates(null)} className="text-xs px-2 py-1 rounded border hover:bg-muted">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-4 text-xs text-muted-foreground items-center">
                      {entry.next_follow_up_scheduled && <span>Follow-up: {entry.next_follow_up_scheduled}</span>}
                      {entry.next_meeting_scheduled && <span>Meeting: {entry.next_meeting_scheduled}</span>}
                      <button onClick={() => openDateEdit(entry)} className="text-xs underline text-muted-foreground hover:text-foreground">
                        {entry.next_follow_up_scheduled || entry.next_meeting_scheduled ? "Edit dates" : "Set dates"}
                      </button>
                    </div>
                  )}
                </div>

                <select
                  disabled={saving === entry.client_id}
                  value={entry.status}
                  onChange={e => handleStatus(entry.client_id, e.target.value as ProjectClient["status"])}
                  className="text-xs border rounded px-2 py-1 bg-background focus:outline-none shrink-0 disabled:opacity-40">
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
