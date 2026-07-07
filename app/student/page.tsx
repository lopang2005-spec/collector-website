"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function StudentVerifyPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"email" | "code">("email");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    setLoading(false);

    if (otpError) {
      setError("Couldn't send a code. Check the email and try again.");
      return;
    }

    setStage("code");
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    if (verifyError) {
      setLoading(false);
      setError("That code didn't work — check it and try again.");
      return;
    }

    // A valid code only proves they own this email address — it doesn't
    // mean the email belongs to a school on the active list. Check that
    // separately before letting them into the catalog.
    const { data: verified } = await supabase.rpc("is_verified_student");

    setLoading(false);

    if (!verified) {
      setError(
        "That email verified, but it's not on our current list of school emails. If your school should be included, message us on WhatsApp."
      );
      return;
    }

    router.push("/student/catalog");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-sm rounded-lg p-6">
        <h1 className="font-display text-2xl">Student discount</h1>
        <p className="mt-2 text-sm text-muted">
          Verify your school email to unlock the student-only catalog.
        </p>

        {stage === "email" ? (
          <form onSubmit={handleSendCode}>
            <label className="mt-5 block text-sm text-muted">
              School email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@yourschool.ac.bw"
              className="mt-1 w-full rounded border border-border bg-surface px-3 py-2"
            />

            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-5 w-full rounded px-4 py-2 font-medium disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode}>
            <label className="mt-5 block text-sm text-muted">
              Enter the code sent to {email}
            </label>
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="6-digit code"
              className="mt-1 w-full rounded border border-border bg-surface px-3 py-2"
            />

            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-5 w-full rounded px-4 py-2 font-medium disabled:opacity-60"
            >
              {loading ? "Checking…" : "Verify"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStage("email");
                setCode("");
                setError(null);
              }}
              className="mt-3 w-full rounded border border-border px-4 py-2 text-sm"
            >
              Use a different email
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
