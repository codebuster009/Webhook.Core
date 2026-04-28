import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { createPartner } from '../../services/partners.api.js';

export default function RegisterPartnerModal({ open, onClose, onCreated }) {
  const [searchParams] = useSearchParams();
  const [name, setName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [description, setDescription] = useState('');
  const [secret, setSecret] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open && searchParams.get('demoSecret') === '1') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- demo query hydrates static screenshot secret
      setSecret('whsec_demo_screenshot_placeholder_only');
    }
  }, [open, searchParams]);

  async function submit() {
    setBusy(true);
    try {
      const partner = await createPartner({
        name,
        webhookUrl,
        description,
      });
      setSecret(partner.signingSecret);
      onCreated?.(partner);
    } finally {
      setBusy(false);
    }
  }

  function close() {
    setName('');
    setWebhookUrl('');
    setDescription('');
    setSecret('');
    onClose();
  }

  return (
    <Modal
      open={open}
      title={secret ? 'Signing secret' : 'Register partner'}
      onClose={close}
      footer={
        secret ? (
          <div className="flex justify-end">
            <Button type="button" onClick={close}>
              Done
            </Button>
          </div>
        ) : (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={close}>
              Cancel
            </Button>
            <Button type="button" disabled={busy || !name || !webhookUrl} onClick={submit}>
              Create
            </Button>
          </div>
        )
      }
    >
      {secret ? (
        <div className="space-y-2 rounded-md border border-amber-200 bg-amber-50 p-3 font-mono text-xs">
          <p className="font-semibold text-amber-900">Save this signing secret — shown once.</p>
          <code className="block break-all">{secret}</code>
        </div>
      ) : (
        <div className="space-y-3">
          <label className="block text-sm">
            Name
            <input
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            Webhook URL
            <input
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="http://mock-partner:4001/webhook"
            />
            <span className="mt-1 block text-xs text-muted">
              If API + worker run in Docker Compose, use the service hostname{' '}
              <code className="text-ink">mock-partner</code> (not{' '}
              <code className="text-ink">localhost</code>) so the worker can reach the mock. Path:{' '}
              <code className="text-ink">/webhook</code>.
            </span>
          </label>
          <label className="block text-sm">
            Description
            <textarea
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
        </div>
      )}
    </Modal>
  );
}
