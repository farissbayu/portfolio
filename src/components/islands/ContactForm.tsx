import { useState, type SyntheticEvent } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    const form = new FormData(event.currentTarget);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const data = (await res.json()) as { message?: string; error?: string };

      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setStatus("success");
      setMessage(data.message ?? "Message sent. Thank you.");
      event.currentTarget.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong");
    }
  }

  const field =
    "w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3.5 py-2.5 font-mono text-xs text-zinc-200 placeholder:text-zinc-500 outline-none transition-colors focus:border-matcha-600";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input name="name" required placeholder="name" className={field} />
        <input name="email" type="email" required placeholder="email" className={field} />
      </div>
      <textarea name="message" required rows={5} placeholder="message" className={field} />
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-md bg-matcha-700 px-4 py-2.5 font-mono text-xs text-white shadow-[var(--shadow-matcha-subtle)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-matcha-600 hover:shadow-[var(--shadow-matcha-glow)] disabled:opacity-50"
        >
          {status === "loading" ? "sending…" : "$ send_message"}
        </button>
        {message && (
          <p
            role="status"
            aria-live="polite"
            className={`font-mono text-[11px] ${status === "error" ? "text-red-400" : "text-signal-500"}`}
          >
            {message}
          </p>
        )}
      </div>
    </form>
  );
}
