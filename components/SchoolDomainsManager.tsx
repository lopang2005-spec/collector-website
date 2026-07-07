"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

type SchoolDomain = {
  domain: string;
  school_name: string;
  active: boolean;
};

export default function SchoolDomainsManager({
  initialDomains,
}: {
  initialDomains: SchoolDomain[];
}) {
  const [domains, setDomains] = useState<SchoolDomain[]>(initialDomains);
  const [schoolName, setSchoolName] = useState("");
  const [domain, setDomain] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanDomain = domain.trim().toLowerCase().replace(/^@/, "");
    if (!cleanDomain || !schoolName.trim()) return;

    setSaving(true);
    const { data, error: insertError } = await supabase
      .from("school_domains")
      .insert({ domain: cleanDomain, school_name: schoolName.trim(), active: true })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
    } else if (data) {
      setDomains((prev) =>
        [...prev, data as SchoolDomain].sort((a, b) =>
          a.school_name.localeCompare(b.school_name)
        )
      );
      setDomain("");
      setSchoolName("");
    }
    setSaving(false);
  }

  async function toggleActive(d: SchoolDomain) {
    setError(null);
    const { error: updateError } = await supabase
      .from("school_domains")
      .update({ active: !d.active })
      .eq("domain", d.domain);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDomains((prev) =>
      prev.map((x) => (x.domain === d.domain ? { ...x, active: !x.active } : x))
    );
  }

  async function handleRemove(d: SchoolDomain) {
    if (
      !confirm(
        `Remove ${d.school_name} (${d.domain})? Their students lose access to the student catalog immediately.`
      )
    )
      return;

    setError(null);
    const { error: deleteError } = await supabase
      .from("school_domains")
      .delete()
      .eq("domain", d.domain);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setDomains((prev) => prev.filter((x) => x.domain !== d.domain));
  }

  return (
    <div className="mt-6 grid gap-8 md:grid-cols-[1fr_360px]">
      <div className="space-y-3">
        {domains.length === 0 && (
          <p className="text-muted">
            No schools added yet — students can&apos;t verify until at least
            one is added here.
          </p>
        )}
        {domains.map((d) => (
          <div
            key={d.domain}
            className="card flex items-center gap-4 rounded-lg p-3"
          >
            <div className="flex-1">
              <p className="font-medium">{d.school_name}</p>
              <p className="text-sm text-muted">@{d.domain}</p>
            </div>
            <span
              className={
                "rounded-full px-2 py-0.5 text-xs font-semibold " +
                (d.active
                  ? "bg-accent text-bg"
                  : "border border-border text-muted")
              }
            >
              {d.active ? "Active" : "Off"}
            </span>
            <button
              onClick={() => toggleActive(d)}
              className="text-sm text-accent"
            >
              {d.active ? "Turn off" : "Turn on"}
            </button>
            <button
              onClick={() => handleRemove(d)}
              className="text-sm text-red-400"
            >
              Remove
            </button>
          </div>
        ))}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>

      <form onSubmit={handleAdd} className="card h-fit rounded-lg p-5">
        <h2 className="font-display text-lg">Add school</h2>

        <label className="mt-4 block text-sm text-muted">School name</label>
        <input
          required
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
          placeholder="e.g. BIUST"
          className="mt-1 w-full rounded border border-border bg-surface px-3 py-2"
        />

        <label className="mt-3 block text-sm text-muted">Email domain</label>
        <input
          required
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="biust.ac.bw"
          className="mt-1 w-full rounded border border-border bg-surface px-3 py-2"
        />
        <p className="mt-1 text-xs text-muted">
          Just the part after the @ — a student signing in with
          name@biust.ac.bw is verified by adding biust.ac.bw here.
        </p>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary mt-5 w-full rounded px-4 py-2 font-medium disabled:opacity-60"
        >
          {saving ? "Adding…" : "Add school"}
        </button>
      </form>
    </div>
  );
}
