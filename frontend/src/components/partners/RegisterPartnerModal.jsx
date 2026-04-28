import { useState } from 'react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { createPartner } from '../../services/partners.api.js';

export default function RegisterPartnerModal({ open, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [description, setDescription] = useState('');
  const [secret, setSecret] = useState('');
  const [busy, setBusy] = useState(false);

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
            />
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
