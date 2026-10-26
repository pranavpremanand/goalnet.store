export default function DashboardLoading() {
  return (
    <main className="mx-auto grid max-w-[1440px] animate-pulse gap-7 px-4 py-6 sm:px-7 lg:grid-cols-[230px_1fr] lg:gap-10 lg:px-10 lg:py-10">
      <aside className="hidden space-y-3 lg:block">
        <div className="h-16 border-b border-line bg-canvas" />
        {Array.from({ length: 6 }, (_, index) => <div className="h-10 bg-canvas" key={index} />)}
      </aside>
      <section className="space-y-5">
        <div className="h-16 border-b border-line bg-canvas" />
        <div className="h-52 bg-ink/10" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => <div className="h-28 bg-canvas" key={index} />)}
        </div>
      </section>
    </main>
  );
}