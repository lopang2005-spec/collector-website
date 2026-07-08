"use client";

import { useRef, useState } from "react";

export default function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const touchStartX = useRef<number | null>(null);

  if (images.length === 0) {
    return (
      <div className="card aspect-square overflow-hidden rounded-lg">
        <div className="flex h-full items-center justify-center text-muted">
          No image
        </div>
      </div>
    );
  }

  function goTo(i: number) {
    setActive(Math.max(0, Math.min(images.length - 1, i)));
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      goTo(active + (delta < 0 ? 1 : -1));
    }
    touchStartX.current = null;
  }

  return (
    <div className="min-w-0">
      <div
        className="card relative aspect-square overflow-hidden rounded-lg select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[active]}
          alt={`${name} ${active + 1}`}
          className="h-full w-full object-cover"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              disabled={active === 0}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition disabled:opacity-0"
            >
              <ChevronIcon direction="left" />
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              disabled={active === images.length - 1}
              aria-label="Next image"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition disabled:opacity-0"
            >
              <ChevronIcon direction="right" />
            </button>

            <div className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
              {active + 1} / {images.length}
            </div>

            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={
                    "h-1.5 rounded-full transition-all " +
                    (i === active ? "w-4 bg-white" : "w-1.5 bg-white/50")
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="relative mt-3 min-w-0">
          <div
            className="flex gap-2 overflow-x-auto overscroll-x-contain pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{ scrollSnapType: "x proximity" }}
          >
            {images.map((url, i) => (
              <button
                key={url}
                type="button"
                onClick={() => goTo(i)}
                className={
                  "h-16 w-16 flex-shrink-0 overflow-hidden rounded border-2 transition-colors " +
                  (active === i ? "border-accent" : "border-transparent")
                }
                style={{ scrollSnapAlign: "start" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`${name} ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
          {/* fade edge so a cut-off thumbnail reads as "more to scroll" */}
          <div className="pointer-events-none absolute right-0 top-0 h-16 w-8 bg-gradient-to-l from-bg to-transparent" />
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  const d = direction === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6";
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}
