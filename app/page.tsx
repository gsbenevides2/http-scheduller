"use client";
import { useState } from "react";
import useSchedulers from "./hooks/useSchedullers";
import { formatTriggerValue } from "./utils/formatTriggerValue";
import { HttpScheduller } from "./services/HttpScheduller";
import SchedulerDetailsModal from "./components/SchedulerDetailsModal";
import DeleteConfirmationModal from "./components/DeleteConfirmationModal";

export default function Home() {
  const { schedulers, isLoading, error, deleteScheduler } = useSchedulers();
  const [selectedScheduler, setSelectedScheduler] =
    useState<HttpScheduller | null>(null);
  const [schedulerToDelete, setSchedulerToDelete] = useState<string | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!schedulerToDelete) return;

    setIsDeleting(true);
    try {
      await deleteScheduler(schedulerToDelete);
      setSchedulerToDelete(null);
    } catch (_) {
      alert("Erro ao excluir agendamento");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-black px-20 py-10 font-sans">
      <h1 className="font-bold text-gray-100 text-3xl">Http Schedulers</h1>
      <p className="mt-2 text-gray-400">Gerencie seus agendamentos HTTP</p>
      <div className="mt-5 overflow-x-auto">
        <table className="table">
          {/* head */}
          <thead>
            <tr>
              <th>External ID</th>
              <th>Trigger Type</th>
              <th>Trigger Value</th>
              <th>Method</th>
              <th>URL</th>
              <th>Excluir Antes?</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <td colSpan={7} className="text-center">
                Carregando...
              </td>
            ) : error ? (
              <td colSpan={7} className="text-red-500 text-center">
                {error}
              </td>
            ) : schedulers.length === 0 ? (
              <td colSpan={7} className="text-gray-500 text-center">
                Nenhum agendamento encontrado.
              </td>
            ) : (
              schedulers.map((scheduller) => (
                <tr
                  key={scheduller.externalId}
                  className="hover:bg-zinc-800 cursor-pointer"
                  onClick={() => setSelectedScheduler(scheduller)}
                >
                  <td className="max-w-100 truncate">
                    {scheduller.externalId}
                  </td>
                  <td>{scheduller.triggerType}</td>
                  <td>
                    {formatTriggerValue(
                      scheduller.triggerType,
                      scheduller.triggerValue,
                    )}
                  </td>
                  <td>{scheduller.method}</td>
                  <td>{scheduller.url}</td>
                  <td>{scheduller.excludeBeforeExecution ? "Sim" : "Não"}</td>
                  <td>
                    <button
                      className="text-white btn btn-sm btn-error"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSchedulerToDelete(scheduller.externalId);
                      }}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <SchedulerDetailsModal
        scheduler={selectedScheduler}
        onClose={() => setSelectedScheduler(null)}
      />

      <DeleteConfirmationModal
        isOpen={!!schedulerToDelete}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setSchedulerToDelete(null)}
      />
    </div>
  );
}
