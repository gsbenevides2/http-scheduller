import { useState } from "react";
import { ClientIdToAdd } from "../hooks/useClientIdsQuery";

type ClientIdFormModalProps = {
  isOpen: boolean;
  initialValue?: ClientIdToAdd | null;
  title: string;
  submitLabel: string;
  isSubmitting?: boolean;
  submitError?: string | null;
  onCancel: () => void;
  onSubmit: (clientId: ClientIdToAdd) => Promise<void> | void;
};

export default function ClientIdFormModal({
  isOpen,
  initialValue,
  title,
  submitLabel,
  isSubmitting = false,
  submitError = null,
  onCancel,
  onSubmit,
}: ClientIdFormModalProps) {
  const [hostname, setHostname] = useState(initialValue?.hostname ?? "");
  const [clientId, setClientId] = useState(initialValue?.clientId ?? "");
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!hostname.trim()) {
      setLocalError("Hostname é obrigatório.");
      return;
    }

    if (!clientId.trim()) {
      setLocalError("Client ID é obrigatório.");
      return;
    }

    const payload: ClientIdToAdd = {
      hostname: hostname.trim(),
      clientId: clientId.trim(),
    };

    await onSubmit(payload);
  };

  return (
    <dialog className="modal modal-open">
      <div className="max-w-md modal-box">
        <h3 className="mb-4 font-bold text-lg">{title}</h3>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="font-semibold text-gray-400">Hostname</label>
            <input
              className="w-full input input-bordered"
              value={hostname}
              onChange={(e) => setHostname(e.target.value)}
              placeholder="api.example.com"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-400">Client ID</label>
            <input
              className="w-full input input-bordered"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="abc123"
            />
          </div>

          {localError ? (
            <div className="text-red-400 text-sm">{localError}</div>
          ) : null}

          {submitError ? (
            <div className="text-red-400 text-sm">{submitError}</div>
          ) : null}

          <div className="modal-action">
            <button
              type="button"
              className="btn"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={onCancel}>
        <button type="button">close</button>
      </form>
    </dialog>
  );
}
