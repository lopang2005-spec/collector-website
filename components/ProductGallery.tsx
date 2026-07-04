"use client";

import { useState } from "react";

export default function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="card aspect-square overflow-hidden rounded-lg">
        <div className="flex h-full items-center justify-center text-muted">
          No image
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="card aspect-square overflow-hidden rounded-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[active]}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((url, i) => (
            <button
              key={url}
              onClick={() => setActive(i)}
              className={
                "h-16 w-16 flex-shrink-0 overflow-hidden rounded border-2 " +
                (active === i ? "border-accent" : "border-transparent")
              }
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
      )}
    </div>
  );
}
