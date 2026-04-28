import { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { disablePartner, updatePartner } from '../../services/partners.api.js';

export default function EditPartnerModal({ open, partner, onClose, onSaved }) {
  const [name, setName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (partner) {
      setName(partner.name || '');
      setWebhookUrl(partner.webhookUrl || '');
      setDescription(partner.description || '');
    }
  }, [partner]);

  async function save() {
    if (!partner) return;
    setBusy(true);
    try {
      await updatePartner(partner.id, { name, webhookUrl, description });
      onSaved?.();
      onClose();
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    if (!partner) return;
    setBusy(true);
    try {
      await disablePartner(partner.id);
      onSaved?.();
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open && Boolean(partner)}
      title="Edit partner"
      onClose={onClose}
      footer={
        <div className="flex flex-wrap justify-between gap-2">
          <Button variant="danger" type="button" disabled={busy} onClick={disable}>
            Disable endpoint
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" disabled={busy} onClick={save}>
              Save
            </Button>
          </div>
        </div>
      }
    >
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
    </Modal>
  );
}
