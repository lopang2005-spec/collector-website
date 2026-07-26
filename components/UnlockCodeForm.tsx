"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

const SESSION_FLAG = "tc_student_session_confirmed";

export default function UnlockCodeForm() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // An anonymous session is what lets is_verified_student() check
    // code_unlocks server-side — no email or password involved.
    const { data: userData, error: authError } =
      await supabase.auth.getUser();

    if (!userData.user) {
      const { error: anonError } = await supabase.auth.signInAnonymously();
      if (anonError) {
        setLoading(false);
        setError(
          "Couldn't start a session. Try again, or message us on WhatsApp."
        );
        return;
      }
    } else if (authError) {
      setLoading(false);
      setError("Something went wrong — try again.");
      return;
    }

    const { data: success, error: redeemError } = await supabase.rpc(
      "redeem_student_code",
      { input_code: code.trim() }
    );

    setLoading(false);

    if (redeemError || !success) {
      setError("That code didn't work — check it and try again.");
      return;
    }

    sessionStorage.setItem(SESSION_FLAG, "1");
    router.push("/student/catalog");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="mt-5 block text-sm text-muted">Unlock code</label>
      <input
        required
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter your code"
        className="mt-1 w-full rounded border border-border bg-surface px-3 py-2 uppercase tracking-wide"
      />

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary mt-5 w-full rounded px-4 py-2 font-medium disabled:opacity-60"
      >
        {loading ? "Checking…" : "Unlock"}
      </button>

      <p className="mt-3 text-xs text-muted">
        You'll need to enter this again next time you visit — it doesn't stay
        unlocked on this device.
      </p>
    </form>
  );
}
