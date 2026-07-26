"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

export type UnlockSettings = {
  code: string;
  starts_at: string | null;
  expires_at: string | null;
  active: boolean;
};

function toDateInputValue(iso: string | null) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export default function StudentUnlockSettings({
  initialSettings,
}: {
  initialSettings: UnlockSettings;
}) {
  const [code, setCode] = useState(initialSettings.code);
  const [startsAt, setStartsAt] = useState(
    toDateInputValue(initialSettings.starts_at)
  );
  const [expiresAt, setExpiresAt] = useState(
    toDateInputValue(initialSettings.expires_at)
  );
  const [active, setActive] = useState(initialSettings.active);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const supabase = createClient();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const { error: updateError } = await supabase
      .from("student_unlock_settings")
      .update({
        code: code.trim(),
        starts_at: startsAt ? new Date(startsAt).toISOString() : null,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSavedAt(Date.now());
  }

  async function toggleActive() {
    setError(null);
    const next = !active;
    const { error: updateError } = await supabase
      .from("student_unlock_settings")
      .update({ active: next, updated_at: new Date().toISOString() })
      .eq("id", 1);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setActive(next);
  }

  return (
    <form onSubmit={handleSave} className="card mt-6 max-w-lg rounded-lg p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg">Unlock code</h2>
        <span
          className={
            "rounded-full px-2 py-0.5 text-xs font-semibold " +
            (active ? "bg-accent text-bg" : "border border-border text-muted")
          }
        >
          {active ? "Live" : "Off"}
        </span>
      </div>

      <label className="mt-4 block text-sm text-muted">Code</label>
      <input
        required
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="mt-1 w-full rounded border border-border bg-surface px-3 py-2 uppercase tracking-wide"
      />

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-muted">Starts</label>
          <input
            type="date"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className="mt-1 w-full rounded border border-border bg-surface px-3 py-2"
          />
          <p className="mt-1 text-xs text-muted">Blank = starts immediately</p>
        </div>
        <div>
          <label className="block text-sm text-muted">Expires</label>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="mt-1 w-full rounded border border-border bg-surface px-3 py-2"
          />
          <p className="mt-1 text-xs text-muted">Blank = never expires</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded border border-border p-3">
        <div>
          <p className="text-sm font-medium">Kill switch</p>
          <p className="text-xs text-muted">
            Turns the code off right now, ignoring the expiry date above.
          </p>
        </div>
        <button
          type="button"
          onClick={toggleActive}
          className="text-sm text-accent"
        >
          {active ? "Turn off now" : "Turn on"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <div className="mt-5 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary rounded px-4 py-2 font-medium disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {savedAt && !saving && (
          <span className="text-sm text-muted">Saved</span>
        )}
      </div>
    </form>
  );
}
