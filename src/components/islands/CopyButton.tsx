import { useState } from "react";

interface Props {
  value: string;
  label?: string;
}

export default function CopyButton({ value, label = "copy email" }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      className="inline-flex min-h-11 items-center justify-center rounded-md border border-hairline surface-raised px-3.5 py-2 font-mono text-[11px] text-body transition-all duration-200 hover:-translate-y-0.5 hover:accent-border-strong hover:text-accent md:min-h-0"
    >
      {copied ? "✓ copied" : label}
    </button>
  );
}
