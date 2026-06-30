"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError("Couldn't sign in. Check your email and password.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="card w-full max-w-sm rounded-lg p-6"
      >
        <h1 className="font-display text-2xl">Admin sign in</h1>

        <label className="mt-5 block text-sm text-muted">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded border border-border bg-surface px-3 py-2"
        />

        <label className="mt-4 block text-sm text-muted">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded border border-border bg-surface px-3 py-2"
        />

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary mt-5 w-full rounded px-4 py-2 font-medium disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
