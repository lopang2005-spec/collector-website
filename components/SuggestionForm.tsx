"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

const MAX_IMAGE_MB = 5;
const COOLDOWN_MS = 2 * 60 * 1000; // 1 message per 2 minutes per device
const COOLDOWN_KEY = "tc_last_suggestion_at";

export default function SuggestionForm() {
  const supabase = createClient();
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;
    setError(null);

    if (!picked.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (picked.size > MAX_IMAGE_MB * 1024 * 1024) {
      setError(`Image is too large — please keep it under ${MAX_IMAGE_MB}MB.`);
      return;
    }

    setFile(picked);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(picked);
  }

  function clearImage() {
    setFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function secondsRemaining() {
    const last = Number(localStorage.getItem(COOLDOWN_KEY) ?? 0);
    const remaining = COOLDOWN_MS - (Date.now() - last);
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!message.trim()) {
      setError("Please write a message before sending.");
      return;
    }

    const wait = secondsRemaining();
    if (wait > 0) {
      setError(`Please wait ${wait}s before sending another message.`);
      return;
    }

    setSending(true);
    try {
      let image_path: string | null = null;

      if (file) {
        const ext = file.name.split(".").pop();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("suggestion-images")
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (uploadError) throw uploadError;
        image_path = path;
      }

      const { error: insertError } = await supabase.from("suggestions").insert({
        message: message.trim(),
        contact: contact.trim() || null,
        image_path,
      });
      if (insertError) throw insertError;

      localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
      setSent(true);
      setMessage("");
      setContact("");
      clearImage();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-display text-2xl">Thanks!</h1>
        <p className="mt-2 text-sm text-muted">
          Your message has been sent. We read every one.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-6 rounded bg-accent px-4 py-2 text-sm font-medium text-bg"
        >
          Send another
        </button>
        <div className="mt-3">
          <Link href="/shop" className="text-sm text-muted underline">
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="font-display text-2xl">Send us a message</h1>
      <p className="mt-1 text-sm text-muted">
        Requests, feedback, or something you saw and want us to source. We read every one.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-muted">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="Type your message..."
            className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-muted">
            Name / WhatsApp number (optional)
          </label>
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="So we can get back to you — totally optional"
            className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-muted">
            Photo (optional)
          </label>
          {preview ? (
            <div className="relative w-24 h-24">
              <img src={preview} alt="Attachment preview" className="h-full w-full rounded object-cover" />
              <button
                type="button"
                onClick={clearImage}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-bg text-xs text-text"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded border border-dashed border-border px-3 py-2 text-xs text-muted"
            >
              Attach photo
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={sending}
          className="rounded bg-accent py-3 text-sm font-medium text-bg disabled:opacity-60"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
