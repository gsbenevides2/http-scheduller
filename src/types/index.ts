// Enum para tipos de conta conforme o diagrama UML
export enum AccountTypes {
	DEBIT = "Debit",
	CREDIT = "Credit",
}

// Interface para UUID
export type UUID = string;

// Interface para TransactionCategory baseada no diagrama UML
export interface TransactionCategory {
	id: UUID;
	name: string;
	createdAt: Date;
	updatedAt: Date;
}

// Interface para Account baseada no diagrama UML
export interface Account {
	id: UUID;
	name: string;
	accountType: AccountTypes;
	createdAt: Date;
	updatedAt: Date;
}

// Interface para MonthReference
export interface MonthReference {
	id: UUID;
	month: number;
	year: number;
	active: boolean;
	createdAt: Date;
	updatedAt: Date;
}

// Interface para Transaction baseada no diagrama UML
export interface Transaction {
	id: UUID;
	dateTime: Date;
	thirdParty: string;
	value: number;
	address?: string;
	description: string;
	invoiceData?: string;
	accountId: UUID;
	categoryId: UUID;
	monthReferenceId: UUID;
	createdAt: Date;
	updatedAt: Date;
}

// Interface para as transações relacionadas (auto-relação)
export interface TransactionRelation {
	id: UUID;
	parentTransactionId: UUID;
	relatedTransactionId: UUID;
	createdAt: Date;
}

// Interfaces para DTOs e formulários
export interface CreateTransactionDto {
	dateTime: Date;
	thirdParty: string;
	value: number;
	address?: string;
	description: string;
	invoiceData?: string;
	accountId: UUID;
	categoryId: UUID;
	monthReferenceId: UUID;
	relatedTransactionIds?: UUID[];
}

export interface UpdateTransactionDto extends Partial<CreateTransactionDto> {
	id: UUID;
}

export interface CreateAccountDto {
	name: string;
	accountType: AccountTypes;
}

export interface UpdateAccountDto extends Partial<CreateAccountDto> {
	id: UUID;
}

export interface CreateTransactionCategoryDto {
	name: string;
}

export interface UpdateTransactionCategoryDto
	extends Partial<CreateTransactionCategoryDto> {
	id: UUID;
}

export interface CreateMonthReferenceDto {
	month: number;
	year: number;
	active?: boolean;
}

export interface UpdateMonthReferenceDto
	extends Partial<CreateMonthReferenceDto> {
	id: UUID;
}

// Interface para filtros de pesquisa
export interface TransactionSearchFilters {
	query?: string;
	startDate?: Date;
	endDate?: Date;
	minValue?: number;
	maxValue?: number;
	accountId?: UUID;
	categoryId?: UUID;
	thirdParty?: string;
	month?: number;
	year?: number;
	monthReferenceId?: UUID;
}

// Interface para resumo mensal baseado no TransactionService do UML
export interface MonthlySummary {
	[accountId: string]: number;
}

// Interface para resumo de conta
export interface AccountSummary {
	account: Account;
	totalTransactions: number;
	currentBalance: number;
	monthlyTotal: number;
}
