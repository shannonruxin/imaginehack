"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getProjects, generateCustomBatch, type BatchFilters, type Project, type ProjectClient } from "@/lib/api";

const STATUS_COLOR: Record<ProjectClient["status"], string> = {
  to_follow_up: "bg-blue-100 text-blue-700",
  meeting_scheduled: "bg-yellow-100 text-yellow-700",
  stale: "bg-gray-100 text-gray-500",
  followup_after_success: "bg-green-100 text-green-700",
};

const STATUS_LABEL: Record<string, string> = {
  to_follow_up: "To follow up",
  meeting_scheduled: "Meeting scheduled",
  stale: "Stale",
  followup_after_success: "Follow up after success",
};

const LIFE_SIGNALS = [
  "new_baby", "marriage", "divorce", "death_in_family", "new_job", "promotion",
  "job_loss", "retirement", "relocation", "new_home", "health_event",
  "graduation", "business_milestone",
];
const PERSONA_TAGS = [
  "family-oriented", "frequent-traveler", "luxury-lifestyle", "health-fitness",
  "career-driven", "entrepreneur", "religious-conservative", "young-professional",
  "outdoor-adventure", "foodie-lifestyle",
];
const PLATFORMS = ["linkedin", "instagram"];
const MARITAL = ["single", "married", "divorced", "engaged"];
const POLICY_TYPES = ["term_life", "whole_life", "medical", "critical_illness", "takaful", "investment_linked"];

const PRESETS: { label: string; filters: BatchFilters }[] = [
  { label: "New baby & family", filters: { label: "New Baby & Family", signals: ["new_baby", "marriage"] } },
  { label: "High urgency events", filters: { label: "High Urgency Events", signals: ["health_event", "job_loss", "death_in_family", "retirement", "new_home", "relocation"] } },
  { label: "Coverage gaps", filters: { label: "Coverage Gaps", no_policies: true } },
  { label: "Recent social activity", filters: { label: "Recent Social Activity", platforms: ["instagram", "linkedin"], only_recent: true } },
];

function pretty(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function statusBreakdown(clients: Project["clients"]) {
  const counts: Record<string, number> = {};
  for (const c of clients) counts[c.status] = (counts[c.status] ?? 0) + 1;
  return counts;
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
        active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted border-border"
      }`}
    >
      {label}
    </button>
  );
}

function ChipGroup({ title, options, selected, onToggle }: {
  title: string; options: string[]; selected: string[]; onToggle: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map(o => (
          <Chip key={o} label={pretty(o)} active={selected.includes(o)} onClick={() => onToggle(o)} />
        ))}
      </div>
    </div>
  );
}

function BatchBuilder({ onGenerated }: { onGenerated: (msg: string) => void }) {
  const [label, setLabel] = useState("");
  const [signals, setSignals] = useState<string[]>([]);
  const [personaTags, setPersonaTags] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [marital, setMarital] = useState<string[]>([]);
  const [missingPolicies, setMissingPolicies] = useState<string[]>([]);
  const [noPolicies, setNoPolicies] = useState(false);
  const [onlyRecent, setOnlyRecent] = useState(false);
  const [generating, setGenerating] = useState(false);

  function toggle(list: string[], setter: (v: string[]) => void, value: string) {
    setter(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);
  }

  function applyPreset(filters: BatchFilters) {
    setLabel(filters.label ?? "");
    setSignals(filters.signals ?? []);
    setPersonaTags(filters.persona_tags ?? []);
    setPlatforms(filters.platforms ?? []);
    setMarital(filters.marital_status ?? []);
    setMissingPolicies(filters.missing_policy_types ?? []);
    setNoPolicies(filters.no_policies ?? false);
    setOnlyRecent(filters.only_recent ?? false);
  }

  function reset() {
    setLabel(""); setSignals([]); setPersonaTags([]); setPlatforms([]);
    setMarital([]); setMissingPolicies([]); setNoPolicies(false); setOnlyRecent(false);
  }

  const hasFilters = signals.length || personaTags.length || platforms.length ||
    marital.length || missingPolicies.length || noPolicies || onlyRecent;

  async function generate() {
    setGenerating(true);
    try {
      const filters: BatchFilters = {
        label: label.trim() || "Custom Batch",
        signals, persona_tags: personaTags, platforms, marital_status: marital,
        missing_policy_types: missingPolicies, no_policies: noPolicies, only_recent: onlyRecent,
      };
      const res = await generateCustomBatch(filters);
      onGenerated(`Queued "${res.label}" — takes a minute. Refresh once done.`);
      reset();
    } catch (e: unknown) {
      onGenerated(`Failed: ${e instanceof Error ? e.message : "unknown error"}`);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="rounded-lg border p-5 space-y-5">
      {/* Presets */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Quick presets</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button key={p.label} onClick={() => applyPreset(p.filters)}
              className="text-xs px-3 py-1.5 rounded-md border-2 border-dashed hover:border-primary hover:bg-muted transition-colors">
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t pt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        <ChipGroup title="Life-event signals" options={LIFE_SIGNALS} selected={signals} onToggle={v => toggle(signals, setSignals, v)} />
        <ChipGroup title="Persona tags" options={PERSONA_TAGS} selected={personaTags} onToggle={v => toggle(personaTags, setPersonaTags, v)} />
        <ChipGroup title="Has recent activity on" options={PLATFORMS} selected={platforms} onToggle={v => toggle(platforms, setPlatforms, v)} />
        <ChipGroup title="Marital status" options={MARITAL} selected={marital} onToggle={v => toggle(marital, setMarital, v)} />
        <ChipGroup title="Missing policy type" options={POLICY_TYPES} selected={missingPolicies} onToggle={v => toggle(missingPolicies, setMissingPolicies, v)} />
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Other</p>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={noPolicies} onChange={e => setNoPolicies(e.target.checked)} />
            No existing policies (uninsured)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={onlyRecent} onChange={e => setOnlyRecent(e.target.checked)} />
            Only signals since last batch
          </label>
        </div>
      </div>

      {/* Label + generate */}
      <div className="border-t pt-5 flex items-end gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Batch name</label>
          <input
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="e.g. New Baby & Family"
            className="w-full text-sm border rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground px-3 py-2">
          Clear
        </button>
        <button
          onClick={generate}
          disabled={generating || !hasFilters}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
        >
          {generating ? "Generating…" : "Generate batch"}
        </button>
      </div>
      {!hasFilters && (
        <p className="text-xs text-muted-foreground">Pick at least one filter, or choose a preset.</p>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [genMsg, setGenMsg] = useState<string | null>(null);

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-1">Projects</h1>
        <p className="text-muted-foreground text-sm">Targeted outreach batches built from client signals, persona, and coverage gaps.</p>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Build a batch</h2>
        <BatchBuilder onGenerated={setGenMsg} />
        {genMsg && <p className="text-sm text-muted-foreground mt-2">{genMsg}</p>}
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">All projects</h2>
        {loading && <p className="text-muted-foreground">Loading…</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {!loading && !error && projects.length === 0 && (
          <p className="text-muted-foreground text-sm">No projects yet — build one above.</p>
        )}

        <div className="space-y-3">
          {projects.map((p, i) => {
            const breakdown = statusBreakdown(p.clients);
            const actioned = p.clients.filter(c => c.status !== "to_follow_up").length;
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
    </div>
  );
}
