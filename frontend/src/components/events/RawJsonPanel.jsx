import { useState } from 'react';
import { Copy } from 'lucide-react';
import { Button } from '../ui/Button.jsx';

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
        <Button
          variant="onDark"
          type="button"
          onClick={copy}
          title={copied ? 'Copied' : 'Copy JSON to clipboard'}
          aria-label={copied ? 'Copied to clipboard' : 'Copy JSON to clipboard'}
          className="!px-3 !py-1.5 text-xs font-semibold uppercase tracking-wide"
        >
          <Copy className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
          {copied ? 'Copied' : 'Copy JSON'}
        </Button>
      </div>
      <pre className="max-h-[420px] overflow-auto p-4 font-mono text-xs leading-relaxed text-emerald-100">
        {text}
      </pre>
    </div>
  );
}
