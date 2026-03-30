export default function DashboardLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Summary cards skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass rounded-xl p-4 h-20">
            <div className="h-2 w-16 bg-white/5 rounded mb-3" />
            <div className="h-4 w-20 bg-white/5 rounded" />
          </div>
        ))}
      </div>

      {/* Filters skeleton */}
      <div className="flex gap-3">
        <div className="h-10 w-48 glass rounded-xl" />
        <div className="h-10 w-32 glass rounded-xl" />
      </div>

      {/* Portfolio chart skeleton */}
      <div className="glass rounded-2xl p-6 h-[400px]">
        <div className="h-3 w-32 bg-white/5 rounded mb-4" />
        <div className="h-full w-full bg-white/[0.02] rounded-xl" />
      </div>

      {/* Channel cards skeleton */}
      <div>
        <div className="h-3 w-40 bg-white/5 rounded mb-3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-4 h-[300px]">
              <div className="h-3 w-24 bg-white/5 rounded mb-4" />
              <div className="grid grid-cols-3 gap-3 mb-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j}>
                    <div className="h-2 w-12 bg-white/5 rounded mb-2" />
                    <div className="h-3 w-16 bg-white/5 rounded" />
                  </div>
                ))}
              </div>
              <div className="h-full w-full bg-white/[0.02] rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
