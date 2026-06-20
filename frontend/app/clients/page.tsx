"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import { getClients, queryClients, type Client } from "@/lib/api";

// ── colour palette ──────────────────────────────────────────────────────────
const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#3b82f6", "#a855f7", "#ec4899", "#14b8a6"];

// ── helpers ─────────────────────────────────────────────────────────────────
function countBy<T>(arr: T[], key: (item: T) => string): { name: string; value: number }[] {
  const map: Record<string, number> = {};
  for (const item of arr) {
    const k = key(item) || "Unknown";
    map[k] = (map[k] ?? 0) + 1;
  }
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));
}

// ── filter state ─────────────────────────────────────────────────────────────
type Filters = {
  nationality: string;
  income_range: string;
  marital_status: string;
  persona_tag: string;
};

const EMPTY_FILTERS: Filters = { nationality: "", income_range: "", marital_status: "", persona_tag: "" };

// ── Insights charts ──────────────────────────────────────────────────────────
function InsightsPanel({ clients }: { clients: Client[] }) {
  const personaTags = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of clients) {
      for (const tag of c.persona?.tags ?? []) map[tag] = (map[tag] ?? 0) + 1;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  }, [clients]);

  const incomeData = useMemo(() => countBy(clients, c => c.income_range), [clients]);
  const maritalData = useMemo(() => countBy(clients, c => c.marital_status), [clients]);
  const signalCoverage = useMemo(() => {
    const platforms = ["linkedin", "instagram", "legacy"];
    return platforms.map(p => ({
      name: p.charAt(0).toUpperCase() + p.slice(1),
      resolved: clients.filter(c => c.socials.some(s => s.type === p)).length,
      unresolved: clients.filter(c => !c.socials.some(s => s.type === p)).length,
    }));
  }, [clients]);
  const policyGap = useMemo(() => [
    { name: "Has policies", value: clients.filter(c => c.existing_policies.length > 0).length },
    { name: "No policies", value: clients.filter(c => c.existing_policies.length === 0).length },
  ], [clients]);

  const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-lg border p-4">
      <p className="text-sm font-medium mb-4">{title}</p>
      {children}
    </div>
  );

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-md border bg-background px-3 py-2 text-xs shadow">
        <p className="font-medium">{payload[0].name}</p>
        <p>{payload[0].value} clients</p>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="rounded-lg border p-4 text-center">
          <p className="text-3xl font-bold">{clients.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Total clients</p>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <p className="text-3xl font-bold">{clients.filter(c => c.existing_policies.length === 0).length}</p>
          <p className="text-sm text-muted-foreground mt-1">No existing policy</p>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <p className="text-3xl font-bold">{clients.filter(c => c.recent_signals.length > 0).length}</p>
          <p className="text-sm text-muted-foreground mt-1">With recent signals</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Persona tag distribution">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={personaTags.slice(0, 8)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                {personaTags.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Marital status">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={maritalData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                {maritalData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Income range">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={incomeData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Social handle coverage">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={signalCoverage}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
              <Bar dataKey="unresolved" name="Missing" fill="#e5e7eb" radius={[4, 4, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="rounded-lg border p-4">
        <p className="text-sm font-medium mb-2">Policy coverage gap</p>
        <div className="flex items-center gap-6">
          <ResponsiveContainer width={160} height={160}>
            <PieChart>
              <Pie data={policyGap} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={45}>
                <Cell fill="#6366f1" />
                <Cell fill="#fca5a5" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2">
            {policyGap.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full inline-block" style={{ background: i === 0 ? "#6366f1" : "#fca5a5" }} />
                <span>{d.name}</span>
                <span className="font-medium ml-1">{d.value}</span>
                <span className="text-muted-foreground text-xs">({((d.value / clients.length) * 100).toFixed(0)}%)</span>
              </div>
            ))}
            <p className="text-xs text-muted-foreground pt-1">
              {policyGap[1]?.value ?? 0} clients are uninsured — immediate opportunity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────
export default function ClientsPage() {
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"list" | "insights">("list");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [llmQuery, setLlmQuery] = useState("");
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmResult, setLlmResult] = useState<{ matching_ids: string[]; explanation: string } | null>(null);

  useEffect(() => {
    getClients()
      .then(setAllClients)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Derived filter options from data
  const nationalities = useMemo(() => [...new Set(allClients.map(c => c.nationality).filter(Boolean))].sort(), [allClients]);
  const incomeRanges = useMemo(() => [...new Set(allClients.map(c => c.income_range).filter(Boolean))], [allClients]);
  const personaTags = useMemo(() => {
    const tags = new Set<string>();
    allClients.forEach(c => c.persona?.tags.forEach(t => tags.add(t)));
    return [...tags].sort();
  }, [allClients]);

  const filtered = useMemo(() => {
    let list = allClients;
    if (llmResult) list = list.filter(c => llmResult.matching_ids.includes(c._id));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
        c.number.includes(q) || c.email.toLowerCase().includes(q)
      );
    }
    if (filters.nationality) list = list.filter(c => c.nationality === filters.nationality);
    if (filters.income_range) list = list.filter(c => c.income_range === filters.income_range);
    if (filters.marital_status) list = list.filter(c => c.marital_status === filters.marital_status);
    if (filters.persona_tag) list = list.filter(c => c.persona?.tags.includes(filters.persona_tag));
    return list;
  }, [allClients, search, filters, llmResult]);

  async function handleLlmQuery() {
    if (!llmQuery.trim()) return;
    setLlmLoading(true);
    setLlmResult(null);
    try {
      const result = await queryClients(llmQuery);
      setLlmResult(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Query failed");
    } finally {
      setLlmLoading(false);
    }
  }

  const selectClass = "px-2 py-1.5 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Clients</h1>
          <p className="text-muted-foreground text-sm">{allClients.length} tracked clients</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border overflow-hidden text-sm">
            {(["list", "insights"] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-4 py-1.5 font-medium transition-colors ${mode === m ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                {m === "list" ? "List" : "Insights"}
              </button>
            ))}
          </div>
          <Link href="/clients/new"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            Add client
          </Link>
        </div>
      </div>

      {loading && <p className="text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && mode === "insights" && <InsightsPanel clients={allClients} />}

      {!loading && !error && mode === "list" && (
        <>
          {/* LLM query box */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={llmQuery}
              onChange={e => setLlmQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLlmQuery()}
              placeholder='Ask anything — e.g. "new parents with no life cover"'
              className="flex-1 px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button onClick={handleLlmQuery} disabled={llmLoading}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {llmLoading ? "Querying…" : "Ask AI"}
            </button>
            {llmResult && (
              <button onClick={() => setLlmResult(null)}
                className="px-3 py-2 rounded-md border text-sm hover:bg-muted transition-colors">
                Clear
              </button>
            )}
          </div>

          {llmResult && (
            <div className="rounded-md bg-muted/50 border px-4 py-2 mb-4 text-sm flex items-center justify-between gap-4">
              <p className="text-muted-foreground"><span className="font-medium text-foreground">{llmResult.matching_ids.length} matches</span> — {llmResult.explanation}</p>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <input type="text" placeholder="Search name / phone / email…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-3 py-1.5 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <select value={filters.nationality} onChange={e => setFilters(f => ({ ...f, nationality: e.target.value }))} className={selectClass}>
              <option value="">All nationalities</option>
              {nationalities.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <select value={filters.income_range} onChange={e => setFilters(f => ({ ...f, income_range: e.target.value }))} className={selectClass}>
              <option value="">All income ranges</option>
              {incomeRanges.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={filters.marital_status} onChange={e => setFilters(f => ({ ...f, marital_status: e.target.value }))} className={selectClass}>
              <option value="">All statuses</option>
              {["single", "married", "divorced", "engaged"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            <select value={filters.persona_tag} onChange={e => setFilters(f => ({ ...f, persona_tag: e.target.value }))} className={selectClass}>
              <option value="">All personas</option>
              {personaTags.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {(search || Object.values(filters).some(Boolean)) && (
              <button onClick={() => { setSearch(""); setFilters(EMPTY_FILTERS); }}
                className="px-3 py-1.5 rounded-md border text-sm hover:bg-muted transition-colors text-muted-foreground">
                Reset
              </button>
            )}
          </div>

          {/* Table */}
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium">Name</th>
                  <th className="text-left px-4 py-2.5 font-medium hidden sm:table-cell">Phone</th>
                  <th className="text-left px-4 py-2.5 font-medium hidden md:table-cell">Income</th>
                  <th className="text-left px-4 py-2.5 font-medium hidden lg:table-cell">Persona</th>
                  <th className="text-left px-4 py-2.5 font-medium hidden lg:table-cell">Signals</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No clients match.</td></tr>
                )}
                {filtered.map(c => (
                  <tr key={c._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/clients/${c._id}`} className="font-medium hover:underline block">
                        {c.first_name} {c.last_name}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {c.age && `${c.age} · `}{c.marital_status} · {c.nationality}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{c.number}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{c.income_range || "—"}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {c.persona?.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{tag}</span>
                        )) ?? <span className="text-muted-foreground text-xs">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex gap-1">
                        {["linkedin", "instagram", "legacy"].map(p => {
                          const has = c.socials.some(s => s.type === p) || c.recent_signals.some(s => s.platform === p);
                          return (
                            <span key={p} title={p} className={`text-xs px-1.5 py-0.5 rounded font-mono ${has ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                              {p[0].toUpperCase()}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{filtered.length} of {allClients.length} clients</p>
        </>
      )}
    </div>
  );
}
