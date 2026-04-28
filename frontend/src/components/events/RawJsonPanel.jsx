import { useState } from 'react';
import { Copy } from 'lucide-react';

export default function RawJsonPanel({ value }) {
  const [copied, setCopied] = useState(false);
  const text = JSON.stringify(value ?? {}, null, 2);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-800 bg-[#0B0B0F]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="text-xs font-semibold text-white/80">Raw Event Payload</span>
        <button
          type="button"
          onClick={copy}
          title={copied ? 'Copied' : 'Copy JSON to clipboard'}
          aria-label={copied ? 'Copied to clipboard' : 'Copy JSON to clipboard'}
          className="inline-flex items-center gap-2 rounded-md border border-white/35 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
        >
          <Copy className="h-3.5 w-3.5 shrink-0 text-white" strokeWidth={2.5} aria-hidden />
          {copied ? 'Copied' : 'Copy JSON'}
        </button>
      </div>
      <pre className="max-h-[420px] overflow-auto p-4 font-mono text-xs leading-relaxed text-emerald-100">
        {text}
      </pre>
    </div>
  );
}
