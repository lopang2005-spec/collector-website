import CatalogGridSkeleton from "@/components/CatalogGridSkeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="h-10 w-48 animate-pulse rounded bg-surface" />
      <div className="mt-6">
        <CatalogGridSkeleton />
      </div>
    </main>
  );
}
