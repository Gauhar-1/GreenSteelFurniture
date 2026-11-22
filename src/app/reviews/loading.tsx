export default function ReviewsLoading() {
  return (
    <div className="w-full bg-[#FAF8F5] min-h-screen py-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-12 animate-pulse">
      {/* Hero Skeleton */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="h-5 w-40 bg-[#18181B]/10 rounded-full mx-auto" />
        <div className="h-10 sm:h-14 w-3/4 bg-[#18181B]/15 rounded-2xl mx-auto" />
        <div className="h-4 w-full bg-[#18181B]/10 rounded-xl mx-auto" />
      </div>

      {/* Filter Skeleton */}
      <div className="flex justify-center">
        <div className="h-12 w-80 bg-white rounded-2xl border border-[#18181B]/10" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-3xl border border-[#18181B]/10 p-6 space-y-4 h-80"
          >
            <div className="flex justify-between items-center">
              <div className="h-5 w-24 bg-zinc-100 rounded-full" />
              <div className="h-4 w-20 bg-zinc-100 rounded-full" />
            </div>
            <div className="h-6 w-3/4 bg-zinc-200 rounded-lg" />
            <div className="h-20 w-full bg-zinc-100 rounded-xl" />
            <div className="pt-4 border-t border-zinc-100 flex justify-between items-center">
              <div className="h-4 w-28 bg-zinc-200 rounded-md" />
              <div className="h-4 w-16 bg-zinc-100 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

