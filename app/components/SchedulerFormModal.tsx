import { useMemo, useState } from "react";
import {
  HttpSchedullerMethods,
  HttpSchedullerToAdd,
} from "../hooks/useSchedulersQuery";
import { httpMethods } from "@/server/utils/httpMethods";

type SchedulerFormModalProps = {
  isOpen: boolean;
  initialValue?: HttpSchedullerToAdd | null;
  disableExternalId?: boolean;
  title: string;
  submitLabel: string;
  isSubmitting?: boolean;
  submitError?: string | null;
  onCancel: () => void;
  onSubmit: (scheduler: HttpSchedullerToAdd) => Promise<void> | void;
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
    () => safeStringifyHeaders(initialValue?.headers ?? undefined),
    [initialValue],
  );

  const initialBody = initialValue?.body ?? "";

  const [externalId, setExternalId] = useState(
    initialValue?.externalId ?? crypto.randomUUID(),
  );
  const [name, setName] = useState(initialValue?.name ?? "");
  const [localError, setLocalError] = useState<string | null>(null);

  // Remount-based form reset is handled by the parent via `key`.
  // Keep this component purely controlled by its initial state.

  const [triggerType, setTriggerType] = useState<"cron" | "date">(
    initialValue?.triggerType ?? "cron",
  );
  const [triggerValue, setTriggerValue] = useState(
    initialValue?.triggerValue ?? "",
  );
  const [excludeBeforeExecution, setExcludeBeforeExecution] = useState(
    initialValue?.excludeBeforeExecution ?? true,
  );
  const [useAuthentikServiceAccount, setUseAuthentikServiceAccount] = useState(
    initialValue?.useAuthentikServiceAccount ?? false,
  );
  const [method, setMethod] = useState<HttpSchedullerMethods>(
    initialValue?.method ?? "GET",
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
      if (
        !parsedHeaders ||
        typeof parsedHeaders !== "object" ||
        Array.isArray(parsedHeaders)
      ) {
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

    const payload: HttpSchedullerToAdd = {
      externalId: externalId.trim(),
      name: name.trim() || null,
      triggerType,
      triggerValue,
      excludeBeforeExecution,
      method,
      url: url.trim(),
      headers: parsedHeaders,
      body,
      useAuthentikServiceAccount,
    };

    await onSubmit(payload);
  };

  return (
    <dialog className="modal modal-open">
      <div className="max-w-3xl modal-box">
        <h3 className="mb-4 font-bold text-lg">{title}</h3>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
            <div>
              <label className="font-semibold text-gray-400">External ID</label>
              <input
                className="w-full input input-bordered"
                value={externalId}
                onChange={(e) => setExternalId(e.target.value)}
                disabled={disableExternalId}
              />
            </div>

            <div>
              <label className="font-semibold text-gray-400">Nome</label>
              <input
                className="w-full input input-bordered"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Health Check"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-400">
                Trigger Type
              </label>
              <select
                className="w-full select-bordered select"
                value={triggerType}
                onChange={(e) =>
                  setTriggerType(e.target.value as "cron" | "date")
                }
              >
                <option value="cron">cron</option>
                <option value="date">date</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-gray-400">Trigger Value</label>
            <input
              className="w-full input input-bordered"
              value={triggerValue}
              onChange={(e) => setTriggerValue(e.target.value)}
              placeholder={
                triggerType === "cron" ? "0 0 * * *" : "YYYY-MM-DDTHH:mm:ssZ"
              }
            />
          </div>

          <div>
            <label className="font-semibold text-gray-400">
              Excluir antes da execução?
            </label>
            <div className="mt-2">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={excludeBeforeExecution}
                onChange={(e) => setExcludeBeforeExecution(e.target.checked)}
              />
            </div>
          </div>
          <div>
            <label className="font-semibold text-gray-400">
              User Conta de Serviço do Authentik?
            </label>
            <div className="mt-2">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={useAuthentikServiceAccount}
                onChange={(e) =>
                  setUseAuthentikServiceAccount(e.target.checked)
                }
              />
            </div>
          </div>

          <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
            <div>
              <label className="font-semibold text-gray-400">Method</label>
              <select
                className="w-full select-bordered select"
                value={method}
                onChange={(e) =>
                  setMethod(e.target.value as HttpSchedullerMethods)
                }
              >
                {httpMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-gray-400">URL</label>
              <input
                className="w-full input input-bordered"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/webhook"
              />
            </div>
          </div>

          <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
            <div>
              <label className="font-semibold text-gray-400">
                Headers (JSON)
              </label>
              <textarea
                className="w-full h-32 font-mono textarea textarea-bordered"
                value={headersText}
                onChange={(e) => setHeadersText(e.target.value)}
                placeholder='{"Content-Type":"application/json"}'
              />
            </div>
            <div>
              <label className="font-semibold text-gray-400">Body</label>
              <textarea
                className="w-full h-32 font-mono textarea textarea-bordered"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder='{"message":"Hello"}'
              />
            </div>
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
