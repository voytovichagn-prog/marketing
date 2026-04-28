"use client";

import { useEffect, useState } from "react";

export default function CopyButton({
  text,
  label = "Скопировать",
  className,
  disabled,
}: {
  text: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const onClick = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // ignore
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !text}
      className={
        className ??
        "inline-flex items-center gap-1.5 rounded-md border border-foreground/15 bg-background px-2.5 py-1 text-xs font-medium hover:bg-foreground/5 disabled:opacity-30"
      }
    >
      {copied ? (
        <>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Скопировано
        </>
      ) : (
        <>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}
