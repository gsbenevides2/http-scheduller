import { useMemo, useState } from "react";
import { HttpScheduller } from "../services/HttpScheduller";

type SchedulerFormModalProps = {
  isOpen: boolean;
  initialValue?: HttpScheduller | null;
  disableExternalId?: boolean;
  title: string;
  submitLabel: string;
  isSubmitting?: boolean;
  submitError?: string | null;
  onCancel: () => void;
  onSubmit: (scheduler: HttpScheduller) => Promise<void> | void;
};

function safeStringifyHeaders(headers?: Record<string, string>) {
  try {
    return JSON.stringify(headers ?? {}, null, 2);
  } catch {
    return "{}";
  }
}

export default function SchedulerFormModal({
  isOpen,
  initialValue,
  disableExternalId = false,
  title,
  submitLabel,
  isSubmitting = false,
  submitError = null,
  onCancel,
  onSubmit,
}: SchedulerFormModalProps) {
  const initialHeadersText = useMemo(
    () => safeStringifyHeaders(initialValue?.headers),
    [initialValue]
  );

  const initialBody = initialValue?.body ?? "";

  const [externalId, setExternalId] = useState(initialValue?.externalId ?? "");
  const [localError, setLocalError] = useState<string | null>(null);

  // Remount-based form reset is handled by the parent via `key`.
  // Keep this component purely controlled by its initial state.

  const [triggerType, setTriggerType] = useState<"cron" | "date">(
    initialValue?.triggerType ?? "cron"
  );
  const [triggerValue, setTriggerValue] = useState(
    initialValue?.triggerValue ?? ""
  );
  const [excludeBeforeExecution, setExcludeBeforeExecution] = useState(
    initialValue?.excludeBeforeExecution ?? true
  );
  const [method, setMethod] = useState<HttpScheduller["method"]>(
    initialValue?.method ?? "GET"
  );
  const [url, setUrl] = useState(initialValue?.url ?? "");
  const [headersText, setHeadersText] = useState(initialHeadersText);
  const [body, setBody] = useState(initialBody);



  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLocalError(null);

    if (!externalId.trim()) {
      setLocalError("External ID é obrigatório.");
      return;
    }

    let parsedHeaders: Record<string, string> = {};
    try {
      const raw = headersText.trim();
      parsedHeaders = raw ? (JSON.parse(raw) as Record<string, string>) : {};
      if (!parsedHeaders || typeof parsedHeaders !== "object" || Array.isArray(parsedHeaders)) {
        throw new Error("Headers precisam ser um objeto JSON.");
      }
      for (const [k, v] of Object.entries(parsedHeaders)) {
        if (typeof v !== "string") {
          throw new Error(`Header '${k}' precisa ser string.`);
        }
      }
    } catch (err) {
      setLocalError(`Headers inválidos: ${(err as Error).message}`);
      return;
    }

    const payload: HttpScheduller = {
      externalId: externalId.trim(),
      triggerType,
      triggerValue,
      excludeBeforeExecution,
      method,
      url: url.trim(),
      headers: parsedHeaders,
      body,
    };

    await onSubmit(payload);
  };

  return (
    <dialog className="modal modal-open">
      <div className="max-w-3xl modal-box">
        <h3 className="mb-4 font-bold text-lg">{title}</h3>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="font-semibold text-gray-400">External ID</label>
              <input
                className="input input-bordered w-full"
                value={externalId}
                onChange={(e) => setExternalId(e.target.value)}
                disabled={disableExternalId}
              />
            </div>

            <div>
              <label className="font-semibold text-gray-400">Trigger Type</label>
              <select
                className="select select-bordered w-full"
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value as "cron" | "date")}
              >
                <option value="cron">cron</option>
                <option value="date">date</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-gray-400">Trigger Value</label>
            <input
              className="input input-bordered w-full"
              value={triggerValue}
              onChange={(e) => setTriggerValue(e.target.value)}
              placeholder={triggerType === "cron" ? "0 0 * * *" : "YYYY-MM-DDTHH:mm:ssZ"}
            />
          </div>

          <div>
            <label className="font-semibold text-gray-400">Excluir antes da execução?</label>
            <div className="mt-2">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={excludeBeforeExecution}
                onChange={(e) => setExcludeBeforeExecution(e.target.checked)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="font-semibold text-gray-400">Method</label>
              <select
                className="select select-bordered w-full"
                value={method}
                onChange={(e) => setMethod(e.target.value as HttpScheduller["method"])}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-gray-400">URL</label>
              <input
                className="input input-bordered w-full"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/webhook"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="font-semibold text-gray-400">Headers (JSON)</label>
              <textarea
                className="textarea textarea-bordered w-full h-32 font-mono"
                value={headersText}
                onChange={(e) => setHeadersText(e.target.value)}
                placeholder='{"Content-Type":"application/json"}'
              />
            </div>
            <div>
              <label className="font-semibold text-gray-400">Body</label>
              <textarea
                className="textarea textarea-bordered w-full h-32 font-mono"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder='{"message":"Hello"}'
              />
            </div>
          </div>

          {localError ? (
            <div className="text-sm text-red-400">{localError}</div>
          ) : null}

          {submitError ? (
            <div className="text-sm text-red-400">{submitError}</div>
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
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
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
