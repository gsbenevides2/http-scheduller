export function formatDate(date: Date | string): string {
	const d = typeof date === "string" ? new Date(date) : date;
	return d.toLocaleDateString("pt-BR");
}

export function formatDateTime(
	date: Date | string,
	includeTime: boolean = false,
): string {
	const d = typeof date === "string" ? new Date(date) : date;
	return d.toLocaleString("pt-BR", {
		hour: includeTime ? "2-digit" : undefined,
		minute: includeTime ? "2-digit" : undefined,
		second: includeTime ? "2-digit" : undefined,
	});
}

export function formatDateTimeForInput(date: Date | string): string {
	const d = typeof date === "string" ? new Date(date) : date;
	// return d.toISOString().slice(0, 16);
	const month = d.getMonth() + 1;
	const twoDigitMonth = month < 10 ? `0${month}` : month;
	const day = d.getDate();
	const twoDigitDay = day < 10 ? `0${day}` : day;
	const hours = d.getHours();
	const twoDigitHours = hours < 10 ? `0${hours}` : hours;
	const minutes = d.getMinutes();
	const twoDigitMinutes = minutes < 10 ? `0${minutes}` : minutes;
	return `${d.getFullYear()}-${twoDigitMonth}-${twoDigitDay}T${twoDigitHours}:${twoDigitMinutes}`;
}

export function formatCurrency(value: number): string {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(value);
}

export function parseDate(dateString: string): Date {
	return new Date(dateString);
}

export function isDateInRange(
	date: Date,
	startDate?: Date,
	endDate?: Date,
): boolean {
	if (startDate && date < startDate) return false;
	if (endDate && date > endDate) return false;
	return true;
}

export function getMonthStart(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getMonthEnd(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function getCurrentMonth(): { month: number; year: number } {
	const now = new Date();
	return {
		month: now.getMonth() + 1,
		year: now.getFullYear(),
	};
}

export function getDateRange(period: "today" | "week" | "month" | "year"): {
	startDate: Date;
	endDate: Date;
} {
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);

	if (period === "today") {
		return { startDate: today, endDate: tomorrow };
	}

	if (period === "week") {
		const weekStart = new Date(today);
		weekStart.setDate(weekStart.getDate() - weekStart.getDay());
		const weekEnd = new Date(weekStart);
		weekEnd.setDate(weekEnd.getDate() + 7);
		return { startDate: weekStart, endDate: weekEnd };
	}

	if (period === "month") {
		return { startDate: getMonthStart(now), endDate: getMonthEnd(now) };
	}

	if (period === "year") {
		const yearStart = new Date(now.getFullYear(), 0, 1);
		const yearEnd = new Date(now.getFullYear() + 1, 0, 1);
		return { startDate: yearStart, endDate: yearEnd };
	}

	return { startDate: today, endDate: tomorrow };
}
