"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentProject, getProjects, getClients, updateProjectClient, type Project, type Client, type ProjectClient } from "@/lib/api";

const STATUS_LABEL: Record<string, string> = {
  to_follow_up: "Follow up",
  meeting_rescheduled: "Rescheduled",
  stale: "Stale",
  help_me_out: "Help me out",
};

const STATUS_COLOR: Record<string, string> = {
  to_follow_up: "bg-blue-100 text-blue-700",
  meeting_rescheduled: "bg-yellow-100 text-yellow-700",
  stale: "bg-gray-100 text-gray-500",
  help_me_out: "bg-red-100 text-red-700",
};

const STATUS_OPTIONS: ProjectClient["status"][] = [
  "to_follow_up", "meeting_rescheduled", "stale", "help_me_out",
];

export default function DashboardPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clientMap, setClientMap] = useState<Record<string, Client>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getCurrentProject(), getProjects(), getClients()])
      .then(([current, all, clients]) => {
        setProject(current);
        setProjects(all);
        const map: Record<string, Client> = {};
        for (const c of clients) map[c._id] = c;
        setClientMap(map);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleStatus(clientId: string, status: ProjectClient["status"]) {
    if (!project) return;
    setSaving(clientId);
    await updateProjectClient(project._id, clientId, { status }).catch(() => null);
    setProject(p => p ? { ...p, clients: p.clients.map(c => c.client_id === clientId ? { ...c, status } : c) } : p);
    setSaving(null);
  }

  const done = project?.clients.filter(c => c.status === "stale" || c.status === "meeting_rescheduled").length ?? 0;
  const total = project?.clients.length ?? 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main batch panel */}
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">This Week&apos;s Batch</h1>
            {project && (
              <p className="text-muted-foreground text-sm mt-0.5">
                {new Date(project.created_at).toLocaleDateString("en-MY", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            )}
          </div>
          {total > 0 && (
            <div className="text-right">
              <p className="text-2xl font-bold">{done}/{total}</p>
              <p className="text-xs text-muted-foreground">actioned</p>
            </div>
          )}
        </div>

        {loading && <p className="text-muted-foreground">Loading…</p>}

        {!loading && !project && (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground text-sm">
            No batch yet. Trigger one from the workers panel or wait for Monday.
          </div>
        )}

        {project && (
          <>
            <div className="rounded-lg border bg-muted/40 p-4 mb-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Batch angle</p>
              <p className="text-sm">{project.batch_sales_angle || "No angle generated."}</p>
            </div>

            <div className="space-y-2">
              {project.clients.map(entry => {
                const client = clientMap[entry.client_id];
                const name = client ? `${client.first_name} ${client.last_name}` : "…";
                return (
                  <div key={entry.client_id} className="rounded-lg border p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link href={`/clients/${entry.client_id}`} className="font-medium text-sm hover:underline">
                            {name}
                          </Link>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_COLOR[entry.status] ?? ""}`}>
                            {STATUS_LABEL[entry.status]}
                          </span>
                        </div>
                        {entry.notes && <p className="text-sm text-muted-foreground line-clamp-2">{entry.notes}</p>}
                        <div className="flex gap-4 mt-1.5 text-xs text-muted-foreground">
                          {entry.next_follow_up_scheduled && <span>Follow-up: {entry.next_follow_up_scheduled}</span>}
                          {entry.next_meeting_scheduled && <span>Meeting: {entry.next_meeting_scheduled}</span>}
                        </div>
                      </div>
                      <select
                        disabled={saving === entry.client_id}
                        value={entry.status}
                        onChange={e => handleStatus(entry.client_id, e.target.value as ProjectClient["status"])}
                        className="text-xs border rounded px-2 py-1 bg-background focus:outline-none shrink-0 disabled:opacity-40"
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Project history strip */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Past Batches</h2>
        {loading && <p className="text-muted-foreground text-sm">Loading…</p>}
        <div className="space-y-2">
          {projects.slice(1).map(p => {
            const done = p.clients.filter(c => c.status === "stale" || c.status === "meeting_rescheduled").length;
            return (
              <Link key={p._id} href={`/projects/${p._id}`}
                className="block rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {new Date(p.created_at).toLocaleDateString("en-MY", { month: "short", day: "numeric" })}
                  </span>
                  <span className="text-xs text-muted-foreground">{done}/{p.clients.length}</span>
                </div>
                {p.batch_sales_angle && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.batch_sales_angle}</p>
                )}
              </Link>
            );
          })}
          {!loading && projects.length <= 1 && (
            <p className="text-sm text-muted-foreground">No past batches.</p>
          )}
        </div>
      </div>
    </div>
  );
}
