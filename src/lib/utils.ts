export const money = (n: number | string) =>
  Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
export const phone = (s: string) => {
  const d = s.replace(/\D/g, "");
  return d.length === 10 || d.length === 11 ? "55" + d : d;
};
export const dateTime = (s: string) =>
  new Date(s).toLocaleString("pt-BR", {
    timeZone: "America/Fortaleza",
    dateStyle: "short",
    timeStyle: "short",
  });
export const dayKey = (s: string | Date) =>
  new Date(s).toLocaleDateString("en-CA", { timeZone: "America/Fortaleza" });
export function periodStart(period: string, now = new Date()) {
  const d = new Date(dayKey(now) + "T12:00:00-03:00");
  if (period === "week")
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  if (period === "month") d.setUTCDate(1);
  return dayKey(d);
}
export const statusLabel = {
  new: "Novo",
  conversation: "Em conversa",
  completed: "Concluído",
};
