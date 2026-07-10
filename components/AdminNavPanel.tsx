"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/schools", label: "Schools" },
  { href: "/admin/settings", label: "Branding" },
];

export default function AdminNavPanel() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);
  useEffect(() => setOpen(false), [pathname]);

  const overlay = (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={
          "fixed inset-0 z-50 bg-black/50 transition-opacity " +
          (open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0")
        }
      />

      {/* Side panel */}
      <div
        className={
          "fixed right-0 top-0 z-50 h-full w-72 max-w-[80vw] transform bg-surface shadow-xl transition-transform duration-300 " +
          (open ? "translate-x-0" : "translate-x-full")
        }
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <span className="font-display text-lg">Admin Menu</span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="text-2xl leading-none text-muted hover:text-text"
          >
            ×
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-5 py-4">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={
                  "rounded px-2 py-3 text-sm " +
                  (active ? "text-accent" : "text-text hover:bg-bg")
                }
              >
                {link.label}
              </Link>
            );
          })}

          <div className="mt-4 border-t border-border pt-4 px-2">
            <SignOutButton />
          </div>
        </nav>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open admin menu"
        className="flex h-9 w-9 flex-col items-center justify-center gap-1.5"
      >
        <span className="h-0.5 w-6 bg-text" />
        <span className="h-0.5 w-6 bg-text" />
        <span className="h-0.5 w-6 bg-text" />
      </button>

      {mounted ? createPortal(overlay, document.body) : null}
    </>
  );
}
