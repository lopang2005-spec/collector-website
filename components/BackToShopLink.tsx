"use client";

import { useRouter } from "next/navigation";

function BackArrowIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

// A plain <Link href="/shop"> always loads /shop fresh, scrolled to the top —
// so scrolling back down to where you were browsing is lost every time.
// Using router.back() instead replays real browser back navigation, which
// Next.js restores the previous scroll position for. Falls back to a normal
// push if there's no same-site history to go back to (e.g. a shared link
// opened directly).
export default function BackToShopLink() {
  const router = useRouter();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    const cameFromThisSite =
      typeof document !== "undefined" &&
      document.referrer.includes(window.location.host);

    if (cameFromThisSite && window.history.length > 1) {
      router.back();
    } else {
      router.push("/shop");
    }
  }

  return (
    <a
      href="/shop"
      onClick={handleClick}
      className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-accent"
    >
      <BackArrowIcon />
      Back to Shop
    </a>
  );
}
