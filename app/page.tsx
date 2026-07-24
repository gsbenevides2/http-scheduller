"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HttpSchedullerReceived,
  HttpSchedullerToAdd,
  useSchedulersQuery,
} from "./hooks/useSchedulersQuery";
import { formatTriggerValue } from "./utils/formatTriggerValue";

import SchedulerDetailsModal from "./components/SchedulerDetailsModal";
import DeleteConfirmationModal from "./components/DeleteConfirmationModal";
import SchedulerFormModal from "./components/SchedulerFormModal";

export default function Home() {
  const {
    schedulers,
    isLoading,
    error,
    deleteScheduler,
    upsertScheduler,
    testScheduler,
  } = useSchedulersQuery();

  const [selectedScheduler, setSelectedScheduler] = useState<
    HttpSchedullerReceived | HttpSchedullerToAdd | null
  >(null);

  const [schedulerToDelete, setSchedulerToDelete] = useState<string | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [saveError, setSaveError] = useState<string | null>(null);
  const [, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!schedulerToDelete) return;

    setDeleteError(null);
    setIsDeleting(true);
    try {
      const ok = await deleteScheduler(schedulerToDelete);
      if (!ok) {
        setDeleteError("Não foi possível excluir o agendamento.");
        return;
      }
      setSchedulerToDelete(null);
    } catch {
      setDeleteError("Erro ao excluir agendamento.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateSave = async (scheduler: HttpSchedullerToAdd) => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await upsertScheduler(scheduler);
      setIsCreateOpen(false);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsSaving(false);
    }
  };

  const isError = isLoading === false && Boolean(error);
  const isEmpty = isLoading === false && schedulers.length === 0;

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-black px-20 py-10 font-sans">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="font-bold text-gray-100 text-3xl">Http Schedulers</h1>
          <p className="mt-2 text-gray-400">Gerencie seus agendamentos HTTP</p>
        </div>
        <div className="flex gap-2">
          <Link href="/client-ids" className="text-white btn btn-outline">
            Client IDs
          </Link>
          <Link href="/telemetry" className="text-white btn btn-outline">
            Telemetria
          </Link>
          <button
            className="text-white btn btn-primary"
            onClick={() => setIsCreateOpen(true)}
          >
            Nova Request
          </button>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
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
              <tr>
                <td colSpan={8} className="text-center">
                  Carregando...
                </td>
              </tr>
            ) : null}
            {isError ? (
              <tr>
                <td colSpan={8} className="text-red-500 text-center">
                  {error}
                </td>
              </tr>
            ) : null}
            {isEmpty ? (
              <tr>
                <td colSpan={8} className="text-gray-500 text-center">
                  Nenhum agendamento encontrado.
                </td>
              </tr>
            ) : null}
            {schedulers.map((scheduller) => (
              <tr
                key={scheduller.externalId}
                className="hover:bg-zinc-800 cursor-pointer"
                onClick={() => setSelectedScheduler(scheduller)}
              >
                <td className="max-w-40 truncate">{scheduller.name || "-"}</td>
                <td className="max-w-100 truncate">{scheduller.externalId}</td>
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
            ))}
          </tbody>
        </table>
      </div>

      <SchedulerDetailsModal
        key={selectedScheduler?.externalId}
        scheduler={selectedScheduler}
        onClose={() => setSelectedScheduler(null)}
        onUpsert={async (next) => {
          await upsertScheduler(next);
          setSelectedScheduler(next);
        }}
        onTest={async (s) => {
          return await testScheduler(s);
        }}
      />

      <DeleteConfirmationModal
        isOpen={!!schedulerToDelete}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setSchedulerToDelete(null)}
      />

      <SchedulerFormModal
        key="new"
        isOpen={isCreateOpen}
        initialValue={null}
        disableExternalId={false}
        title="Nova Request"
        submitLabel="Criar"
        isSubmitting={isSaving}
        submitError={saveError}
        onCancel={() => {
          setIsCreateOpen(false);
          setSaveError(null);
        }}
        onSubmit={handleCreateSave}
      />
    </div>
  );
}
