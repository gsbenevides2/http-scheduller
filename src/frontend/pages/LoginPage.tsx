import { LogIn } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { apiClient } from "../services/api";

export function LoginPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showInvalidCredentials, setShowInvalidCredentials] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const repsonse = await apiClient.api.auth.login.post({
			password,
			username,
		});
		if (repsonse.error) {
			setShowInvalidCredentials(true);
		} else {
			navigate("/");
		}
	};

	const handleInputChange =
		(setter: (value: string) => void) =>
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setter(e.target.value);
			if (showInvalidCredentials) {
				setShowInvalidCredentials(false);
			}
		};

	return (
		<div className="min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center px-4">
			<div className="w-full max-w-md">
				<Card className="bg-gray-800 border-gray-700">
					<CardHeader>
						<CardTitle className="text-center text-gray-100 flex flex-col items-center justify-center gap-2">
							<h1 className="text-3xl font-bold text-gray-100">
								Http Scheduller
							</h1>
							<p className="text-gray-400 mt-2">
								Faça login para acessar a plataforma
							</p>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<label
									htmlFor="username"
									className="block text-sm font-medium text-gray-300 mb-2"
								>
									Usuário
								</label>
								<Input
									id="username"
									type="text"
									value={username}
									onChange={handleInputChange(setUsername)}
									placeholder="seu_usuario"
									required
									className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
								/>
							</div>
							<div>
								<label
									htmlFor="password"
									className="block text-sm font-medium text-gray-300 mb-2"
								>
									Senha
								</label>
								<Input
									id="password"
									type="password"
									value={password}
									onChange={handleInputChange(setPassword)}
									placeholder="Sua senha"
									required
									className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
								/>
							</div>
							{showInvalidCredentials && (
								<p className="text-red-500 text-sm">
									Credenciais inválidas. Tente novamente.
								</p>
							)}
							<Button
								type="submit"
								className="w-full bg-blue-600 hover:bg-blue-700 text-white"
							>
								<LogIn className="w-4 h-4 mr-2" />
								Entrar
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
