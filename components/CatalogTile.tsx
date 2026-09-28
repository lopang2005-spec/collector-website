"use client";

import { useState } from "react";
import Link from "next/link";

export default function CatalogTile({
  href,
  name,
  count,
  imageUrl,
}: {
  href: string;
  name: string;
  count: number;
  imageUrl: string | null;
}) {
  // If the picture fails to load, fall back to the plain gold card instead
  // of showing a broken image.
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(imageUrl) && !failed;

  return (
    <Link
      href={href}
      className={
        "group relative block aspect-[4/5] overflow-hidden rounded-lg border bg-surface " +
        "transition duration-200 hover:scale-[1.02] active:scale-[0.98] " +
        "hover:shadow-[0_0_0_1px_var(--accent),0_0_18px_-4px_var(--accent)] " +
        "focus-visible:shadow-[0_0_0_1px_var(--accent),0_0_18px_-4px_var(--accent)] " +
        (showImage
          ? "border-border hover:border-accent"
          : "border-accent/70 hover:border-accent")
      }
    >
      {showImage && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl as string}
            alt=""
            loading="lazy"
            onError={() => setFailed(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
        </>
      )}

      <div className="absolute inset-x-0 bottom-0 p-4">
        <h2
          className={
            "font-display text-2xl uppercase leading-none tracking-wide sm:text-3xl " +
            (showImage ? "text-white" : "text-text")
          }
        >
          {name}
        </h2>
        <p
          className={
            "mt-1.5 text-xs uppercase tracking-wide " +
            (showImage ? "text-white/70" : "text-muted")
          }
        >
          {count} {count === 1 ? "item" : "items"}
        </p>
      </div>
    </Link>
  );
}
