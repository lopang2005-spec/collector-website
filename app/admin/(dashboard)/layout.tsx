import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";
import AdminNavPanel from "@/components/AdminNavPanel";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/admin" className="font-display text-lg">
            Admin
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-5">
            <Link href="/admin/products" className="text-sm text-muted hover:text-text">
              Products
            </Link>
            <Link href="/admin/categories" className="text-sm text-muted hover:text-text">
              Categories
            </Link>
            <Link href="/admin/orders" className="text-sm text-muted hover:text-text">
              Orders
            </Link>
            <Link href="/admin/schools" className="text-sm text-muted hover:text-text">
              Schools
            </Link>
            <Link href="/admin/settings" className="text-sm text-muted hover:text-text">
              Branding
            </Link>
            <SignOutButton />
          </nav>

          {/* Mobile: hamburger opens side panel */}
          <div className="md:hidden">
            <AdminNavPanel />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
