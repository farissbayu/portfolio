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
    <button type="button" onClick={copy} aria-label={label} className="p-btn p-btn--ghost">
      <span>{copied ? "✓ copied" : label}</span>
    </button>
  );
}
