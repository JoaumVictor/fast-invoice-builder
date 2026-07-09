import { Invoice, LineItem } from "./types";

const STORAGE_KEY = "fast-invoice-builder.invoices";

export function listInvoices(): Invoice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Invoice[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getInvoice(id: string): Invoice | undefined {
  return listInvoices().find((inv) => inv.id === id);
}

export function saveInvoice(invoice: Invoice): void {
  const invoices = listInvoices();
  const index = invoices.findIndex((inv) => inv.id === invoice.id);
  if (index >= 0) invoices[index] = invoice;
  else invoices.push(invoice);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
}

export function deleteInvoice(id: string): void {
  const invoices = listInvoices().filter((inv) => inv.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
}

export function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function newItem(partial: Partial<LineItem> = {}): LineItem {
  return { id: newId(), product: "", quantity: 1, unitPrice: 0, ...partial };
}

function lastInvoice(): Invoice | undefined {
  const invoices = listInvoices();
  if (invoices.length === 0) return undefined;
  return invoices.reduce((a, b) => (b.updatedAt > a.updatedAt ? b : a));
}

/** "0006" -> "0007", "INV-09" -> "INV-10", no digits -> "0001" */
export function nextNumber(previous: string | undefined): string {
  if (!previous) return "0001";
  const match = previous.match(/(\d+)(?!.*\d)/);
  if (!match) return "0001";
  const digits = match[1];
  const incremented = String(parseInt(digits, 10) + 1).padStart(
    digits.length,
    "0"
  );
  return (
    previous.slice(0, match.index) +
    incremented +
    previous.slice(match.index! + digits.length)
  );
}

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Last day of the previous month (issued on) and of the current month (due by). */
export function smartDates(now = new Date()): { issuedOn: string; dueBy: string } {
  const issuedOn = new Date(now.getFullYear(), now.getMonth(), 0);
  const dueBy = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { issuedOn: toDateString(issuedOn), dueBy: toDateString(dueBy) };
}

/**
 * Smart defaults for a new invoice: repeats From / To / items from the most
 * recently saved invoice, increments its number, and pre-fills the dates with
 * the last day of the previous month and of the current month.
 */
export function smartDraft(): Invoice {
  const last = lastInvoice();
  const number = nextNumber(last?.number);
  const { issuedOn, dueBy } = smartDates();
  return {
    id: newId(),
    fileName: `invoice-${number}`,
    number,
    from: last?.from ?? "",
    to: last?.to ?? "",
    items: last
      ? last.items.map((item) => newItem({ ...item, id: newId() }))
      : [newItem()],
    issuedOn,
    dueBy,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
