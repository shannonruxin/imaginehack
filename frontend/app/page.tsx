// Route: / — Dashboard (current week's outreach batch)
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">This Week&apos;s Batch</h1>
      <p className="text-muted-foreground text-sm mb-6">Your outreach todo list for the week.</p>
      <p className="text-muted-foreground">Loading…</p>
    </div>
  );
}
