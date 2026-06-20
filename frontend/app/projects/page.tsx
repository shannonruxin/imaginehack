"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getProjects, type Project, type ProjectClient } from "@/lib/api";

const STATUS_COLOR: Record<ProjectClient["status"], string> = {
  to_follow_up: "bg-blue-100 text-blue-700",
  meeting_rescheduled: "bg-yellow-100 text-yellow-700",
  stale: "bg-gray-100 text-gray-500",
  help_me_out: "bg-red-100 text-red-700",
};

function statusBreakdown(clients: Project["clients"]) {
  const counts: Record<string, number> = {};
  for (const c of clients) counts[c.status] = (counts[c.status] ?? 0) + 1;
  return counts;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const STATUS_LABEL: Record<string, string> = {
    to_follow_up: "Follow up",
    meeting_rescheduled: "Rescheduled",
    stale: "Stale",
    help_me_out: "Help",
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Projects</h1>
      <p className="text-muted-foreground text-sm mb-6">Weekly outreach batches.</p>

      {loading && <p className="text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {!loading && !error && projects.length === 0 && (
        <p className="text-muted-foreground">No projects yet.</p>
      )}

      <div className="space-y-3">
        {projects.map((p, i) => {
          const breakdown = statusBreakdown(p.clients);
          const actioned = (breakdown["stale"] ?? 0) + (breakdown["meeting_rescheduled"] ?? 0);
          return (
            <Link key={p._id} href={`/projects/${p._id}`}
              className="block rounded-lg border p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {new Date(p.created_at).toLocaleDateString("en-MY", {
                        weekday: "short", year: "numeric", month: "short", day: "numeric",
                      })}
                    </span>
                    {i === 0 && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">
                        Current
                      </span>
                    )}
                  </div>
                  {p.batch_sales_angle && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{p.batch_sales_angle}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium">{actioned}/{p.clients.length}</p>
                  <p className="text-xs text-muted-foreground">actioned</p>
                  <div className="flex gap-1 mt-2 justify-end flex-wrap">
                    {Object.entries(breakdown).map(([status, count]) => (
                      <span key={status} className={`text-xs px-1.5 py-0.5 rounded font-medium ${STATUS_COLOR[status as ProjectClient["status"]]}`}>
                        {count} {STATUS_LABEL[status] ?? status}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
