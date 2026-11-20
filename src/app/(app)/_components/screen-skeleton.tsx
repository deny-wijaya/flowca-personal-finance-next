/** Placeholder saat data layar dimuat (streaming Suspense). */
export function ScreenSkeleton() {
  return (
    <div aria-label="Memuat data" aria-busy="true" className="flex animate-pulse flex-col gap-4 px-5 pt-5 lg:px-8 lg:pt-7">
      <div className="h-8 w-40 rounded-md bg-sand-200" />
      <div className="h-28 rounded-2xl bg-sand-200" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-20 rounded-xl bg-sand-200" />
        <div className="h-20 rounded-xl bg-sand-200" />
      </div>
      <div className="h-60 rounded-2xl bg-sand-200" />
    </div>
  );
}
