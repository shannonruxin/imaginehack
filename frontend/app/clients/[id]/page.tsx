// Route: /clients/[id] — Client detail (Overview / Signals / Chat / Angle tabs)
export default function ClientDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Client</h1>
      <p className="text-muted-foreground text-sm mb-6">ID: {params.id}</p>
      <p className="text-muted-foreground">Loading…</p>
    </div>
  );
}
