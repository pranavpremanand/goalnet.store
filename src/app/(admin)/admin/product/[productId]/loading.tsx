export default function AdminProductLoading() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse space-y-6">
      <div className="h-4 w-24 bg-canvas" />
      <div className="h-12 w-64 bg-canvas" />
      <div className="grid gap-5 border border-line p-5 md:grid-cols-[200px_1fr]">
        <div className="aspect-square bg-canvas" />
        <div className="space-y-4">
          <div className="h-11 bg-canvas" />
          <div className="h-28 bg-canvas" />
          <div className="h-11 bg-canvas" />
        </div>
      </div>
    </div>
  );
}