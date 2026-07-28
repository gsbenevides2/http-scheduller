export function formatTriggerValue(
  triggerType: "cron" | "date",
  triggerValue: string | Date,
): string {
  if (triggerType === "cron" && typeof triggerValue === "string") {
    return `Cron: ${triggerValue}`;
  }

  if (triggerType === "date") {
    const date =
      triggerValue instanceof Date
        ? triggerValue
        : new Date(triggerValue);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString();
    }
  }

  return "Valor de trigger inválido";
}
