import { FileX } from "lucide-react";
import React from "react";
import { ButtonLink } from "../components/ui/button";

export function ErrorPage() {
	return (
		<div className="min-h-screen bg-gray-900 text-gray-200">
			<div className="container mx-auto px-4 py-8">
				<div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
					<FileX className="w-24 h-24 text-gray-400 mb-6" />

					<h1 className="text-6xl font-bold text-gray-100 mb-4">500</h1>

					<h2 className="text-2xl font-semibold text-gray-300 mb-4">
						Erro ao autenticar
					</h2>

					<p className="text-gray-400 mb-8 max-w-md">
						Ocorreu um erro ao autenticar. Tente novamente.
					</p>

					<ButtonLink
						href="/"
						className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
					>
						Voltar ao início
					</ButtonLink>
				</div>
			</div>
		</div>
	);
}
