"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ClientIdToAdd,
  ClientIdReceived,
  useClientIdsQuery,
} from "../hooks/useClientIdsQuery";
import ClientIdFormModal from "../components/ClientIdFormModal";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

export default function ClientIdsPage() {
  const {
    clientIds,
    isLoading,
    error,
    deleteClientId,
    upsertClientId,
  } = useClientIdsQuery();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hostnameToDelete, setHostnameToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!hostnameToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteClientId(hostnameToDelete);
      setHostnameToDelete(null);
    } catch {
      setDeleteError("Erro ao excluir client ID.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateSave = async (clientId: ClientIdToAdd) => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await upsertClientId(clientId);
      setIsCreateOpen(false);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsSaving(false);
    }
  };

  const isEmpty = !isLoading && clientIds.length === 0;

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-black px-20 py-10 font-sans">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-gray-200">
              ← Voltar
            </Link>
            <h1 className="font-bold text-gray-100 text-3xl">Client IDs</h1>
          </div>
          <p className="mt-2 text-gray-400">
            Gerencie mapeamentos de hostname para client_id do Authentik
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="text-white btn btn-primary"
            onClick={() => setIsCreateOpen(true)}
          >
            Novo Client ID
          </button>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Hostname</th>
              <th>Client ID</th>
              <th>Criado em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="text-center">
                  Carregando...
                </td>
              </tr>
            ) : null}
            {error ? (
              <tr>
                <td colSpan={4} className="text-red-500 text-center">
                  {error}
                </td>
              </tr>
            ) : null}
            {isEmpty ? (
              <tr>
                <td colSpan={4} className="text-gray-500 text-center">
                  Nenhum client ID encontrado.
                </td>
              </tr>
            ) : null}
            {clientIds.map((item: ClientIdReceived) => (
              <tr key={item.hostname} className="hover:bg-zinc-800">
                <td className="font-mono">{item.hostname}</td>
                <td className="font-mono max-w-80 truncate">{item.clientId}</td>
                <td>
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleString("pt-BR")
                    : "-"}
                </td>
                <td>
                  <button
                    className="text-white btn btn-sm btn-error"
                    onClick={() => setHostnameToDelete(item.hostname)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DeleteConfirmationModal
        isOpen={!!hostnameToDelete}
        isDeleting={isDeleting}
        errorMessage={deleteError}
        onConfirm={handleDelete}
        onCancel={() => {
          setHostnameToDelete(null);
          setDeleteError(null);
        }}
      />

      {/* Create Modal */}
      <ClientIdFormModal
        key="new"
        isOpen={isCreateOpen}
        initialValue={null}
        title="Novo Client ID"
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
