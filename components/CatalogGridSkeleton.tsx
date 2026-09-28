// Placeholder cards shown while the catalogs load.
export default function CatalogGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
      aria-busy="true"
      aria-label="Loading catalogs"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="aspect-[4/5] animate-pulse rounded-lg border border-border bg-surface"
        />
      ))}
    </div>
  );
}
