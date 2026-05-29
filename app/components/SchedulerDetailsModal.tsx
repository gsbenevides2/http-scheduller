import { HttpScheduller } from "../services/HttpScheduller";
import { formatTriggerValue } from "../utils/formatTriggerValue";

interface SchedulerDetailsModalProps {
  scheduler: HttpScheduller | null;
  onClose: () => void;
}

export default function SchedulerDetailsModal({
  scheduler,
  onClose,
}: SchedulerDetailsModalProps) {
  if (!scheduler) return null;

  return (
    <dialog className="modal modal-open">
      <div className="max-w-3xl modal-box">
        <h3 className="mb-4 font-bold text-lg">Detalhes do Agendamento</h3>
        <div className="space-y-3">
          <div>
            <label className="font-semibold text-gray-400">External ID:</label>
            <p className="text-gray-200 break-all">{scheduler.externalId}</p>
          </div>
          <div>
            <label className="font-semibold text-gray-400">
              Trigger Type:
            </label>
            <p className="text-gray-200">{scheduler.triggerType}</p>
          </div>
          <div>
            <label className="font-semibold text-gray-400">
              Trigger Value:
            </label>
            <p className="text-gray-200">
              {formatTriggerValue(scheduler.triggerType, scheduler.triggerValue)}
            </p>
          </div>
          <div>
            <label className="font-semibold text-gray-400">Method:</label>
            <p className="text-gray-200">{scheduler.method}</p>
          </div>
          <div>
            <label className="font-semibold text-gray-400">URL:</label>
            <p className="text-gray-200 break-all">{scheduler.url}</p>
          </div>
          <div>
            <label className="font-semibold text-gray-400">
              Excluir Antes da Execução:
            </label>
            <p className="text-gray-200">
              {scheduler.excludeBeforeExecution ? "Sim" : "Não"}
            </p>
          </div>
          <div>
            <label className="font-semibold text-gray-400">Headers:</label>
            <pre className="bg-zinc-800 mt-2 p-3 rounded overflow-x-auto text-gray-200">
              {JSON.stringify(scheduler.headers, null, 2)}
            </pre>
          </div>
          <div>
            <label className="font-semibold text-gray-400">Body:</label>
            <pre className="bg-zinc-800 mt-2 p-3 rounded overflow-x-auto text-gray-200">
              {scheduler.body || "(vazio)"}
            </pre>
          </div>
        </div>
        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button>close</button>
      </form>
    </dialog>
  );
}
