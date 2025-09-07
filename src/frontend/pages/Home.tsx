import React, { useCallback, useEffect, useState } from "react";
import type { HttpScheduller } from "../../backend/services/HttpScheduller";
import { Button } from "../components/ui/button";
import { apiClient } from "../services/api";

export const Home: React.FC = () => {
	const [schedulers, setSchedulers] = useState<HttpScheduller[]>([]);
	const [loading, setLoading] = useState(false);

	// Função para buscar todos os schedulers
	const getSchedulers = useCallback(async () => {
		setLoading(true);
		try {
			const response = await apiClient.api["http-scheduller"].get();
			// O endpoint retorna um array de HttpScheduller
			setSchedulers(response.data || []);
		} catch (error) {
			console.error("Error fetching schedulers", error);
		} finally {
			setLoading(false);
		}
	}, []);

	const handleLogout = async () => {
		await apiClient.api.auth.logout.post();
		window.location.href = "/login";
	};

	const handleDelete = async (externalId: string) => {
		try {
			await apiClient.api["http-scheduller"].delete([externalId]);
			setSchedulers((prev) => prev.filter((s) => s.externalId !== externalId));
		} catch (error) {
			console.error("Error deleting scheduler", error);
		}
	};

	// Busca todos os schedulers ao carregar a página
	useEffect(() => {
		getSchedulers();
	}, [getSchedulers]);

	return (
		<div className="min-h-screen bg-gray-900 text-gray-200">
			<div className="container mx-auto px-4 py-8">
				<header className="mb-8 flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold text-gray-100">
							Http Schedulers
						</h1>
						<p className="text-gray-400 mt-2">
							Gerencie seus agendamentos HTTP
						</p>
					</div>
					<div className="flex gap-4">
						<Button variant="destructive" onClick={handleLogout}>
							<svg
								className="h-4 w-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
								/>
							</svg>
							Logout
						</Button>
					</div>
				</header>

				{/* Tabela de schedulers */}
				<div className="bg-gray-800 rounded-lg overflow-hidden">
					<div className="grid grid-cols-7 gap-4 p-4 border-b border-gray-700 font-bold text-gray-100">
						<span>External ID</span>
						<span>Trigger Type</span>
						<span>Trigger Value</span>
						<span>URL</span>
						<span>Method</span>
						<span>Excluir Antes?</span>
						<span>Ações</span>
					</div>

					{loading ? (
						<div className="p-8 text-center text-gray-400">Carregando...</div>
					) : schedulers.length === 0 ? (
						<div className="p-8 text-center text-gray-400">
							<svg
								className="h-12 w-12 mx-auto mb-4 text-gray-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
								/>
							</svg>
							<p className="text-lg">Nenhum scheduler cadastrado</p>
							<p className="text-sm">
								Clique em "Adicionar nova conta" para adicionar uma conta.
							</p>
						</div>
					) : (
						schedulers.map((scheduler) => (
							<div
								key={scheduler.externalId}
								className="grid grid-cols-7 gap-4 p-4 border-b border-gray-700 hover:bg-gray-750 transition-colors"
							>
								<span className="font-medium text-gray-200">
									{scheduler.externalId}
								</span>
								<span>{scheduler.triggerType}</span>
								<span>{scheduler.triggerValue}</span>
								<span className="truncate max-w-xs">{scheduler.url}</span>
								<span>{scheduler.method}</span>
								<span>{scheduler.excludeBeforeExecution ? "Sim" : "Não"}</span>
								<span>
									<Button
										variant="destructive"
										size="sm"
										onClick={() => handleDelete(scheduler.externalId)}
									>
										Excluir
									</Button>
								</span>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
};
