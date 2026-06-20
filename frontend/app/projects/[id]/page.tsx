"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  getProject,
  getClients,
  updateProjectClient,
  type Project,
  type Client,
  type ProjectClient,
} from "@/lib/api";

const STATUS_OPTIONS: ProjectClient["status"][] = [
  "to_follow_up",
  "meeting_rescheduled",
  "stale",
  "help_me_out",
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
  stale: "bg-gray-100 text-gray-600",
  help_me_out: "bg-red-100 text-red-700",
};

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [clientMap, setClientMap] = useState<Record<string, Client>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getProject(id), getClients()])
      .then(([proj, clients]) => {
        setProject(proj);
        const map: Record<string, Client> = {};
        for (const c of clients) map[c._id] = c;
        setClientMap(map);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleStatusChange(clientId: string, status: ProjectClient["status"]) {
    if (!project) return;
    setSaving(clientId);
    try {
      await updateProjectClient(id, clientId, { status });
      setProject((p) =>
        p
          ? {
              ...p,
              clients: p.clients.map((c) =>
                c.client_id === clientId ? { ...c, status } : c
              ),
            }
          : p
      );
    } finally {
      setSaving(null);
    }
  }

  if (loading) return <p className="text-muted-foreground">Loading…</p>;
  if (error || !project)
    return (
      <div>
        <p className="text-sm text-red-500">{error ?? "Project not found."}</p>
        <Link href="/projects" className="text-sm text-muted-foreground hover:underline mt-2 block">
          ← Back to projects
        </Link>
      </div>
    );

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/projects" className="text-muted-foreground hover:text-foreground text-sm">
          ← Projects
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="text-2xl font-semibold">
          Batch —{" "}
          {new Date(project.created_at).toLocaleDateString("en-MY", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </h1>
      </div>

      <div className="rounded-lg border bg-muted/40 p-4 mb-6">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
          Batch angle
        </p>
        <p className="text-sm">{project.batch_sales_angle || "No angle set."}</p>
      </div>

      <div className="space-y-2">
        {project.clients.map((entry) => {
          const client = clientMap[entry.client_id];
          const name = client
            ? `${client.first_name} ${client.last_name}`
            : entry.client_id;
          return (
            <div key={entry.client_id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/clients/${entry.client_id}`}
                    className="font-medium text-sm hover:underline"
                  >
                    {name}
                  </Link>
                  {entry.notes && (
                    <p className="text-sm text-muted-foreground mt-1">{entry.notes}</p>
                  )}
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    {entry.next_follow_up_scheduled && (
                      <span>Follow-up: {entry.next_follow_up_scheduled}</span>
                    )}
                    {entry.next_meeting_scheduled && (
                      <span>Meeting: {entry.next_meeting_scheduled}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[entry.status]}`}
                  >
                    {STATUS_LABEL[entry.status]}
                  </span>
                  <select
                    disabled={saving === entry.client_id}
                    value={entry.status}
                    onChange={(e) =>
                      handleStatusChange(entry.client_id, e.target.value as ProjectClient["status"])
                    }
                    className="text-xs border rounded px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
