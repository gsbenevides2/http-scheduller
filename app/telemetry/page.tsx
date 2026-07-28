"use client";

import { useState } from "react";
import Link from "next/link";
import { useTelemetryQuery, TelemetryRecord } from "../hooks/useTelemetryQuery";
import { useSchedulersQuery } from "../hooks/useSchedulersQuery";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

export default function TelemetryPage() {
  const [selectedScheduler, setSelectedScheduler] = useState<string>("");
  const [selectedRecord, setSelectedRecord] = useState<TelemetryRecord | null>(null);
  const [page, setPage] = useState(1);
  const limit = 50;

  const { records, isLoading, error, stats, total, deleteRecords, clearAll } =
    useTelemetryQuery(selectedScheduler || undefined, page, limit);
  const { schedulers } = useSchedulersQuery();

  const totalPages = Math.ceil(total / limit);
  const paginatedRecords = records;

  const [deleteTarget, setDeleteTarget] = useState<number[] | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (deleteTarget === null) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      if (deleteTarget.length === 0) {
        await clearAll();
      } else {
        await deleteRecords(deleteTarget);
      }
      setDeleteTarget(null);
    } catch {
      setDeleteError("Erro ao excluir registros.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearAll = async () => {
    setDeleteTarget([]);
  };

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-black px-20 py-10 font-sans">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-gray-200">
              ← Voltar
            </Link>
            <h1 className="font-bold text-gray-100 text-3xl">Telemetria</h1>
          </div>
          <p className="mt-2 text-gray-400">Histórico de execuções de requests</p>
        </div>
        <div className="flex gap-2">
          <button
            className="text-white btn btn-error btn-sm"
            onClick={handleClearAll}
          >
            Limpar Tudo
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="stat bg-zinc-800 rounded-box p-4">
            <div className="stat-title text-gray-400">Total de Requests</div>
            <div className="stat-value text-gray-100">{stats.total}</div>
          </div>
          <div className="stat bg-zinc-800 rounded-box p-4">
            <div className="stat-title text-gray-400">Sucesso</div>
            <div className="stat-value text-green-400">{stats.successCount}</div>
          </div>
          <div className="stat bg-zinc-800 rounded-box p-4">
            <div className="stat-title text-gray-400">Erros</div>
            <div className="stat-value text-red-400">{stats.errorCount}</div>
          </div>
          <div className="stat bg-zinc-800 rounded-box p-4">
            <div className="stat-title text-gray-400">Tempo Médio</div>
            <div className="stat-value text-gray-100">{stats.averageTimeMs}ms</div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="mt-6 flex gap-4 items-center">
        <select
          className="select select-bordered bg-zinc-800 text-gray-200 border-zinc-700"
          value={selectedScheduler}
          onChange={(e) => {
            setSelectedScheduler(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Todos os Schedulers</option>
          {schedulers.map((s) => (
            <option key={s.externalId} value={s.externalId}>
              {s.name ? `${s.name} - ` : ""}{s.url} ({s.method})
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Data/Hora</th>
              <th>Nome</th>
              <th>Método</th>
              <th>URL</th>
              <th>Status</th>
              <th>Tempo</th>
              <th>Sucesso</th>
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
            {error ? (
              <tr>
                <td colSpan={8} className="text-red-500 text-center">
                  {error}
                </td>
              </tr>
            ) : null}
            {!isLoading && !error && paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-gray-500 text-center">
                  Nenhum registro de telemetria encontrado.
                </td>
              </tr>
            ) : null}
            {paginatedRecords.map((record) => (
              <tr
                key={record.id}
                className="hover:bg-zinc-800 cursor-pointer"
                onClick={() => setSelectedRecord(record)}
              >
                <td className="text-sm">
                  {new Date(record.executedAt).toLocaleString("pt-BR")}
                </td>
                <td className="max-w-40 truncate">{record.requestName || "-"}</td>
                <td>
                  <span className="badge badge-sm">{record.requestMethod}</span>
                </td>
                <td className="max-w-80 truncate">{record.requestUrl}</td>
                <td>
                  <span
                    className={`badge badge-sm ${
                      (record.responseStatus ?? 0) >= 200 && (record.responseStatus ?? 0) < 300
                        ? "badge-success"
                        : record.responseStatus === 0
                          ? "badge-error"
                          : "badge-warning"
                    }`}
                  >
                    {record.responseStatus || "ERR"}
                  </span>
                </td>
                <td>{record.responseTimeMs}ms</td>
                <td>
                  {record.success ? (
                    <span className="text-green-400">✓</span>
                  ) : (
                    <span className="text-red-400">✗</span>
                  )}
                </td>
                <td>
                  <button
                    className="text-white btn btn-sm btn-error"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget([record.id]);
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            className="btn btn-sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </button>
          <span className="btn btn-sm btn-disabled">
            {page} / {totalPages}
          </span>
          <button
            className="btn btn-sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Próxima
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedRecord && (
        <dialog className="modal modal-open">
          <div className="max-w-3xl modal-box">
            <div className="flex justify-between items-center gap-4">
              <h3 className="mb-4 font-bold text-lg">Detalhes da Requisição</h3>
              <button
                className="btn"
                onClick={() => setSelectedRecord(null)}
              >
                Fechar
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-gray-400">Data/Hora:</label>
                <p className="text-gray-200">
                  {new Date(selectedRecord.executedAt).toLocaleString("pt-BR")}
                </p>
              </div>
              <div>
                <label className="font-semibold text-gray-400">Scheduler:</label>
                <p className="text-gray-200 break-all">
                  {selectedRecord.schedulerExternalId || "(manual)"}
                </p>
              </div>
              <div>
                <label className="font-semibold text-gray-400">Nome:</label>
                <p className="text-gray-200">
                  {selectedRecord.requestName || "(sem nome)"}
                </p>
              </div>

              <div className="divider text-gray-400">Requisição</div>

              <div>
                <label className="font-semibold text-gray-400">Método:</label>
                <p className="text-gray-200">{selectedRecord.requestMethod}</p>
              </div>
              <div>
                <label className="font-semibold text-gray-400">URL:</label>
                <p className="text-gray-200 break-all">{selectedRecord.requestUrl}</p>
              </div>
              <div>
                <label className="font-semibold text-gray-400">Headers:</label>
                <pre className="bg-zinc-800 mt-2 p-3 rounded overflow-x-auto text-gray-200">
                  {JSON.stringify(selectedRecord.requestHeaders, null, 2) || "(vazio)"}
                </pre>
              </div>
              <div>
                <label className="font-semibold text-gray-400">Body:</label>
                <pre className="bg-zinc-800 mt-2 p-3 rounded overflow-x-auto text-gray-200">
                  {selectedRecord.requestBody || "(vazio)"}
                </pre>
              </div>

              <div className="divider text-gray-400">Resposta</div>

              <div>
                <label className="font-semibold text-gray-400">Status:</label>
                <p className="text-gray-200">{selectedRecord.responseStatus}</p>
              </div>
              <div>
                <label className="font-semibold text-gray-400">Tempo:</label>
                <p className="text-gray-200">{selectedRecord.responseTimeMs}ms</p>
              </div>
              <div>
                <label className="font-semibold text-gray-400">Sucesso:</label>
                <p className="text-gray-200">
                  {selectedRecord.success ? "Sim" : "Não"}
                </p>
              </div>
              {selectedRecord.errorMessage && (
                <div>
                  <label className="font-semibold text-gray-400">Erro:</label>
                  <pre className="bg-zinc-800 mt-2 p-3 rounded overflow-x-auto text-red-400">
                    {selectedRecord.errorMessage}
                  </pre>
                </div>
              )}
              <div>
                <label className="font-semibold text-gray-400">Body da Resposta:</label>
                <pre className="bg-zinc-800 mt-2 p-3 rounded max-h-64 overflow-x-auto text-gray-200 whitespace-pre-wrap">
                  {selectedRecord.responseBody || "(vazio)"}
                </pre>
              </div>
            </div>
          </div>

          <form method="dialog" className="modal-backdrop" onClick={() => setSelectedRecord(null)}>
            <button type="button">close</button>
          </form>
        </dialog>
      )}

      <DeleteConfirmationModal
        isOpen={deleteTarget !== null}
        isDeleting={isDeleting}
        errorMessage={deleteError}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
      />
    </div>
  );
}
