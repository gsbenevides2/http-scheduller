import React from "react";
import { Button } from "./button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "./dialog";

interface FormModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: FormData) => void | Promise<void>;
	title?: string;
	description?: string;
	isEditing?: boolean;
	isLoading?: boolean;
	children: React.ReactNode;
	submitButtonText?: string;
	cancelButtonText?: string;
	size?: "sm" | "md" | "lg" | "xl";
	fetchers?: string[];
}

const sizeClasses = {
	sm: "sm:max-w-[425px]",
	md: "sm:max-w-[525px]",
	lg: "sm:max-w-[625px]",
	xl: "sm:max-w-[725px]",
};

export function FormModal({
	isOpen,
	onClose,
	onSubmit,
	title,
	description,
	isEditing = false,
	isLoading = false,
	children,
	submitButtonText,
	cancelButtonText = "Cancelar",
	size = "md",
}: FormModalProps) {
	const defaultTitle = isEditing ? "Editar item" : "Criar novo item";
	const defaultSubmitText = isEditing ? "Salvar alterações" : "Criar";

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		await onSubmit(formData);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className={sizeClasses[size]}>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						{isEditing ? (
							<svg
								className="h-5 w-5 text-blue-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
								/>
							</svg>
						) : (
							<svg
								className="h-5 w-5 text-green-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 6v6m0 0v6m0-6h6m-6 0H6"
								/>
							</svg>
						)}
						{title || defaultTitle}
					</DialogTitle>
					{description && <DialogDescription>{description}</DialogDescription>}
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid gap-4 py-4">{children}</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isLoading}
						>
							{cancelButtonText}
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? (
								<>
									<svg
										className="h-4 w-4 animate-spin"
										viewBox="0 0 24 24"
										fill="none"
										aria-hidden="true"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										/>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										/>
									</svg>
									{isEditing ? "Salvando..." : "Criando..."}
								</>
							) : (
								submitButtonText || defaultSubmitText
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
