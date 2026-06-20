"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentProject, getClients, type Project, type Client } from "@/lib/api";

const STATUS_LABEL: Record<string, string> = {
  to_follow_up: "Follow up",
  meeting_rescheduled: "Rescheduled",
  stale: "Stale",
  help_me_out: "Help me out",
};

const STATUS_COLOR: Record<string, string> = {
  to_follow_up: "bg-blue-100 text-blue-700",
  meeting_rescheduled: "bg-yellow-100 text-yellow-700",
  stale: "bg-gray-100 text-gray-600",
  help_me_out: "bg-red-100 text-red-700",
};

export default function DashboardPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [clientMap, setClientMap] = useState<Record<string, Client>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getCurrentProject(), getClients()])
      .then(([proj, clients]) => {
        setProject(proj);
        const map: Record<string, Client> = {};
        for (const c of clients) map[c._id] = c;
        setClientMap(map);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">This Week&apos;s Batch</h1>
      <p className="text-muted-foreground text-sm mb-6">Your outreach todo list for the week.</p>

      {loading && <p className="text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {!loading && !error && !project && (
        <p className="text-muted-foreground">No batch generated yet.</p>
      )}

      {project && (
        <>
          <div className="rounded-lg border bg-muted/40 p-4 mb-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Batch angle
            </p>
            <p className="text-sm">{project.batch_sales_angle || "No angle set."}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {new Date(project.created_at).toLocaleDateString("en-MY", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="space-y-2">
            {project.clients.map((entry) => {
              const client = clientMap[entry.client_id];
              const name = client
                ? `${client.first_name} ${client.last_name}`
                : entry.client_id;
              return (
                <Link
                  key={entry.client_id}
                  href={`/clients/${entry.client_id}`}
                  className="flex items-start gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors block"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{name}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[entry.status] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {STATUS_LABEL[entry.status] ?? entry.status}
                      </span>
                    </div>
                    {entry.notes && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{entry.notes}</p>
                    )}
                    {entry.next_follow_up_scheduled && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Follow-up: {entry.next_follow_up_scheduled}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
