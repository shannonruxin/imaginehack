// Route: /projects/[id] — Project detail
export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Project</h1>
      <p className="text-muted-foreground text-sm mb-6">ID: {params.id}</p>
      <p className="text-muted-foreground">Loading…</p>
    </div>
  );
}
