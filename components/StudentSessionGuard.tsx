"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";

const SESSION_FLAG = "tc_student_session_confirmed";

/**
 * The anonymous Supabase session used for code-unlocked student access
 * persists in a cookie by default (same as a normal login), which would let
 * "unlocked" survive across browser restarts — not what was asked for.
 *
 * This runs once per page load, app-wide. If this browser tab hasn't
 * confirmed an unlock in *this* session (sessionStorage clears itself when
 * the browser closes), it signs out any lingering anonymous session so the
 * next server-rendered check of is_verified_student() comes back false and
 * the student has to re-enter the code.
 *
 * UnlockCodeForm sets the sessionStorage flag right after a successful
 * redeem, so it doesn't sign itself right back out.
 *
 * Known limitation: sessionStorage is per-tab. If a student unlocks in one
 * tab and opens the site in a second tab, the second tab won't see the flag
 * and will sign the shared anonymous session out — which also logs the
 * first tab out. Edge case, but worth knowing about.
 */
export default function StudentSessionGuard() {
  useEffect(() => {
    const alreadyConfirmed = sessionStorage.getItem(SESSION_FLAG);
    if (alreadyConfirmed) return;

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.is_anonymous) {
        supabase.auth.signOut();
      }
    });
  }, []);

  return null;
}
