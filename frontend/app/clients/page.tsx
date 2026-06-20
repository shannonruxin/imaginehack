"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getClients, type Client } from "@/lib/api";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getClients()
      .then(setClients)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
      c.number.includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Clients</h1>
          <p className="text-muted-foreground text-sm">All tracked clients.</p>
        </div>
        <Link
          href="/clients/new"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Add client
        </Link>
      </div>

      {!loading && !error && (
        <input
          type="text"
          placeholder="Search by name, phone or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      )}

      {loading && <p className="text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Name</th>
                <th className="text-left px-4 py-2 font-medium">Phone</th>
                <th className="text-left px-4 py-2 font-medium hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-2 font-medium hidden lg:table-cell">Persona</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                    {search ? "No clients match your search." : "No clients yet."}
                  </td>
                </tr>
              )}
              {filtered.map((c) => (
                <tr key={c._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/clients/${c._id}`} className="font-medium hover:underline">
                      {c.first_name} {c.last_name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {c.marital_status} · {c.nationality}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.number}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{c.email}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {c.persona?.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-block text-xs bg-muted px-2 py-0.5 rounded-full mr-1"
                      >
                        {tag}
                      </span>
                    )) ?? <span className="text-muted-foreground text-xs">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
