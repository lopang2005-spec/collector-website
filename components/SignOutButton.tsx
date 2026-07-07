"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function SignOutButton({
  redirectTo = "/admin/login",
  label = "Sign out",
}: {
  redirectTo?: string;
  label?: string;
}) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-sm text-muted hover:text-text"
    >
      {label}
    </button>
  );
}
