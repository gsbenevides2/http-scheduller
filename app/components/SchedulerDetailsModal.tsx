import { useMemo, useState } from "react";
import { HttpScheduller } from "../services/HttpScheduller";
import { formatTriggerValue } from "../utils/formatTriggerValue";
import SchedulerFormModal from "./SchedulerFormModal";
import { SchedulerTestResult } from "../types/SchedulerTestResult";

interface SchedulerDetailsModalProps {
  scheduler: HttpScheduller | null;
  onClose: () => void;
  onUpsert: (scheduler: HttpScheduller) => Promise<void>;
  onTest: (scheduler: HttpScheduller) => Promise<SchedulerTestResult>;
}

export default function SchedulerDetailsModal({
  scheduler,
  onClose,
  onUpsert,
  onTest,
}: SchedulerDetailsModalProps) {
  const [editOpen, setEditOpen] = useState(false);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<SchedulerTestResult | null>(
    null,
  );
  const [testError, setTestError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const details = useMemo(() => scheduler, [scheduler]);

  if (!details) return null;

  const handleTest = async () => {
    setTesting(true);
    setTestError(null);
    setTestResult(null);

    try {
      const res = await onTest(details);
      setTestResult(res);
      if (!res.ok) setTestError(res.error ?? "Falha no teste da request");
    } catch (e) {
      setTestError(e instanceof Error ? e.message : String(e));
    } finally {
      setTesting(false);
    }
  };

  return (
    <>
      <dialog className="modal modal-open">
        <div className="max-w-3xl modal-box">
          <div className="flex justify-between items-center gap-4">
            <h3 className="mb-4 font-bold text-lg">Detalhes do Agendamento</h3>
            <button className="btn" onClick={onClose}>
              Fechar
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="font-semibold text-gray-400">
                External ID:
              </label>
              <p className="text-gray-200 break-all">{details.externalId}</p>
            </div>
            <div>
              <label className="font-semibold text-gray-400">
                Trigger Type:
              </label>
              <p className="text-gray-200">{details.triggerType}</p>
            </div>
            <div>
              <label className="font-semibold text-gray-400">
                Trigger Value:
              </label>
              <p className="text-gray-200">
                {formatTriggerValue(details.triggerType, details.triggerValue)}
              </p>
            </div>
            <div>
              <label className="font-semibold text-gray-400">Method:</label>
              <p className="text-gray-200">{details.method}</p>
            </div>
            <div>
              <label className="font-semibold text-gray-400">URL:</label>
              <p className="text-gray-200 break-all">{details.url}</p>
            </div>
            <div>
              <label className="font-semibold text-gray-400">
                Excluir Antes da Execução:
              </label>
              <p className="text-gray-200">
                {details.excludeBeforeExecution ? "Sim" : "Não"}
              </p>
            </div>

            <div>
              <label className="font-semibold text-gray-400">Headers:</label>
              <pre className="bg-zinc-800 mt-2 p-3 rounded overflow-x-auto text-gray-200">
                {JSON.stringify(details.headers, null, 2)}
              </pre>
            </div>

            <div>
              <label className="font-semibold text-gray-400">Body:</label>
              <pre className="bg-zinc-800 mt-2 p-3 rounded overflow-x-auto text-gray-200">
                {details.body || "(vazio)"}
              </pre>
            </div>

            <div className="pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setSubmitError(null);
                    setEditOpen(true);
                  }}
                  type="button"
                >
                  Editar
                </button>
                <button
                  className="btn"
                  onClick={handleTest}
                  disabled={testing}
                  type="button"
                >
                  {testing ? "Testando..." : "Teste"}
                </button>
              </div>

              {testError ? (
                <div className="mt-3 text-red-400 text-sm">{testError}</div>
              ) : null}

              {testResult ? (
                <div className="space-y-2 mt-3">
                  <div className="text-sm">
                    <span className="font-semibold">Resultado:</span>{" "}
                    {testResult.ok ? "OK" : "Falha"}
                    {typeof testResult.status === "number"
                      ? ` (HTTP ${testResult.status})`
                      : ""}
                    {typeof testResult.timeMs === "number"
                      ? ` - ${testResult.timeMs}ms`
                      : ""}
                  </div>

                  {typeof testResult.body === "string" ? (
                    <pre className="bg-zinc-800 p-3 rounded max-h-64 overflow-x-auto text-gray-200 whitespace-pre-wrap">
                      {testResult.body || "(vazio)"}
                    </pre>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <form method="dialog" className="modal-backdrop" onClick={onClose}>
          <button type="button">close</button>
        </form>
      </dialog>

      <SchedulerFormModal
        key={details.externalId}
        isOpen={editOpen}
        initialValue={details}
        disableExternalId={true}
        title="Editar Request"
        submitLabel="Salvar"
        isSubmitting={isSubmitting}
        submitError={submitError}
        onCancel={() => {
          setSubmitError(null);
          setIsSubmitting(false);
          setEditOpen(false);
        }}
        onSubmit={async (next) => {
          setIsSubmitting(true);
          setSubmitError(null);
          try {
            await onUpsert(next);
            setEditOpen(false);
          } catch (e) {
            setSubmitError(e instanceof Error ? e.message : String(e));
          } finally {
            setIsSubmitting(false);
          }
        }}
      />
    </>
  );
}
