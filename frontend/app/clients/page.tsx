// Route: /clients — Client list
import Link from "next/link";


export default function ClientsPage() {
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
      <p className="text-muted-foreground">Loading…</p>
    </div>
  );
}
