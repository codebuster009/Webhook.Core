import { useState } from 'react';
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
          variant="secondary"
          className="!border-white/20 !text-white"
          type="button"
          onClick={copy}
        >
          {copied ? 'COPIED' : 'COPY JSON'}
        </Button>
      </div>
      <pre className="max-h-[420px] overflow-auto p-4 font-mono text-xs leading-relaxed text-emerald-100">
        {text}
      </pre>
    </div>
  );
}
