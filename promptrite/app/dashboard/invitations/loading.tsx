export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-1/4 rounded bg-muted" />
          <div className="h-4 w-1/3 rounded bg-muted" />
          <div className="overflow-hidden rounded-lg bg-card ring-1 ring-border ring-inset">
            <div className="border-border border-b px-4 py-3">
              <div className="h-5 w-32 rounded bg-muted" />
            </div>
            <div className="divide-y divide-border">
              {[1, 2, 3].map((i) => (
                <div className="flex items-center gap-3 p-4" key={i}>
                  <div className="h-9 w-9 shrink-0 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-1/2 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
