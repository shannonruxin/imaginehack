"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/api";

const MARITAL_OPTIONS = ["single", "married", "divorced", "engaged"] as const;
const INCOME_OPTIONS = [
  "< RM3,000",
  "RM3,000–RM5,000",
  "RM5,000–RM10,000",
  "RM10,000–RM20,000",
  "> RM20,000",
];

export default function NewClientPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    age: "",
    nationality: "",
    income_range: "",
    number: "",
    email: "",
    marital_status: "single" as (typeof MARITAL_OPTIONS)[number],
  });

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const client = await createClient({
        ...form,
        age: form.age ? Number(form.age) : undefined,
      } as Parameters<typeof createClient>[0]);
      router.push(`/clients/${client._id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save client.");
      setSaving(false);
    }
  }

  const inputClass =
    "w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring";
  const labelClass = "block text-sm font-medium mb-1";

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">Add Client</h1>
        <p className="text-muted-foreground text-sm">
          Handle resolution (Instagram, LinkedIn) runs automatically after save.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>First name</label>
            <input
              required
              className={inputClass}
              value={form.first_name}
              onChange={(e) => set("first_name", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Last name</label>
            <input
              required
              className={inputClass}
              value={form.last_name}
              onChange={(e) => set("last_name", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Age</label>
            <input
              type="number"
              min={1}
              max={120}
              className={inputClass}
              value={form.age}
              onChange={(e) => set("age", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Marital status</label>
            <select
              className={inputClass}
              value={form.marital_status}
              onChange={(e) => set("marital_status", e.target.value)}
            >
              {MARITAL_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o.charAt(0).toUpperCase() + o.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Nationality</label>
          <input
            className={inputClass}
            value={form.nationality}
            onChange={(e) => set("nationality", e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Income range</label>
          <select
            className={inputClass}
            value={form.income_range}
            onChange={(e) => set("income_range", e.target.value)}
          >
            <option value="">Select…</option>
            {INCOME_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>WhatsApp number (E.164)</label>
          <input
            required
            placeholder="+60123456789"
            className={inputClass}
            value={form.number}
            onChange={(e) => set("number", e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            className={inputClass}
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving…" : "Save client"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
