"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

type Suggestion = {
  id: string;
  message: string;
  contact: string | null;
  image_path: string | null;
  is_read: boolean;
  created_at: string;
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function SuggestionInbox() {
  const supabase = createClient();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const { data, error: loadError } = await supabase
      .from("suggestions")
      .select("*")
      .order("created_at", { ascending: false });
    if (loadError) setError(loadError.message);
    setSuggestions((data as Suggestion[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = suggestions.find((s) => s.id === selectedId) ?? null;

  useEffect(() => {
    if (!selected?.image_path || imageUrls[selected.id]) return;
    supabase.storage
      .from("suggestion-images")
      .createSignedUrl(selected.image_path, 3600)
      .then(({ data }) => {
        if (data?.signedUrl) {
          setImageUrls((prev) => ({ ...prev, [selected.id]: data.signedUrl }));
        }
      });
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps

  async function markRead(s: Suggestion) {
    setSelectedId(s.id);
    if (s.is_read) return;
    setSuggestions((prev) => prev.map((x) => (x.id === s.id ? { ...x, is_read: true } : x)));
    await supabase.from("suggestions").update({ is_read: true }).eq("id", s.id);
  }

  async function remove(s: Suggestion) {
    if (!confirm("Delete this suggestion? This can't be undone.")) return;
    setSuggestions((prev) => prev.filter((x) => x.id !== s.id));
    if (selectedId === s.id) setSelectedId(null);
    await supabase.from("suggestions").delete().eq("id", s.id);
    if (s.image_path) {
      await supabase.storage.from("suggestion-images").remove([s.image_path]);
    }
  }

  const unreadCount = suggestions.filter((s) => !s.is_read).length;

  if (loading) return <p className="text-sm text-muted">Loading...</p>;
  if (error) return <p className="text-sm text-red-400">{error}</p>;

  if (suggestions.length === 0) {
    return <p className="text-sm text-muted">No suggestions yet.</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div className="divide-y divide-border rounded border border-border">
        {unreadCount > 0 && (
          <div className="bg-accent/10 px-4 py-2 text-xs font-medium text-accent">
            {unreadCount} unread
          </div>
        )}
        {suggestions.map((s) => (
          <button
            key={s.id}
            onClick={() => markRead(s)}
            className="block w-full px-4 py-3 text-left"
            style={{ backgroundColor: selectedId === s.id ? "var(--surface)" : "transparent" }}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-medium text-text">
                {!s.is_read && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                {s.contact || "Anonymous"}
              </span>
              <span className="text-[11px] text-muted">{timeAgo(s.created_at)}</span>
            </div>
            <p className="line-clamp-2 text-xs text-muted">{s.message}</p>
          </button>
        ))}
      </div>

      <div className="rounded border border-border p-4">
        {selected ? (
          <div>
            <div className="mb-3 flex items-start justify-between">
              <div>
                <p className="font-medium text-text">{selected.contact || "Anonymous"}</p>
                <p className="text-[11px] text-muted">{timeAgo(selected.created_at)}</p>
              </div>
              <button
                onClick={() => remove(selected)}
                className="text-xs text-red-400 hover:underline"
              >
                Delete
              </button>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-text">{selected.message}</p>
            {selected.image_path && (
              imageUrls[selected.id] ? (
                <img
                  src={imageUrls[selected.id]}
                  alt="Attachment"
                  className="mt-3 max-h-64 rounded object-cover"
                />
              ) : (
                <p className="mt-3 text-xs text-muted">Loading image...</p>
              )
            )}
          </div>
        ) : (
          <p className="text-sm text-muted">Select a message to read it.</p>
        )}
      </div>
    </div>
  );
}
