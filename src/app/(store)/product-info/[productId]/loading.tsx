export default function ProductLoading() {
  return (
    <main className="mx-auto grid max-w-[1440px] animate-pulse gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:px-14">
      <div>
        <div className="aspect-square bg-canvas" />
        <div className="mt-3 grid grid-cols-2 gap-3 sm:max-w-[360px]">
          <div className="aspect-[4/3] bg-canvas" />
          <div className="aspect-[4/3] bg-canvas" />
        </div>
      </div>
      <div className="space-y-5 pt-4">
        <div className="h-3 w-28 bg-canvas" />
        <div className="h-12 max-w-md bg-canvas" />
        <div className="h-5 w-36 bg-canvas" />
        <div className="h-9 w-28 bg-canvas" />
        <div className="h-20 max-w-lg bg-canvas" />
        <div className="h-12 max-w-md bg-brand/60" />
      </div>
    </main>
  );
}