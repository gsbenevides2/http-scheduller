export function formatTriggerValue(
  triggerType: "cron" | "date",
  triggerValue: string | Date,
): string {
  if (triggerType === "cron" && typeof triggerValue === "string") {
    return `Cron: ${triggerValue}`;
  } else if (triggerType === "date" && triggerValue instanceof Date) {
    return triggerValue.toLocaleString();
  } else {
    return "Valor de trigger inválido";
  }
}
