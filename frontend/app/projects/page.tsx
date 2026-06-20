"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getProjects, type Project } from "@/lib/api";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Projects</h1>
      <p className="text-muted-foreground text-sm mb-6">All weekly outreach batches.</p>

      {loading && <p className="text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && projects.length === 0 && (
        <p className="text-muted-foreground">No projects yet.</p>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {projects.map((p) => (
            <Link
              key={p._id}
              href={`/projects/${p._id}`}
              className="block rounded-lg border p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">
                  {new Date(p.created_at).toLocaleDateString("en-MY", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="text-xs text-muted-foreground">
                  {p.clients.length} client{p.clients.length !== 1 ? "s" : ""}
                </span>
              </div>
              {p.batch_sales_angle && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {p.batch_sales_angle}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
