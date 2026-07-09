export type LineItem = {
  id: string;
  /** Bold heading shown above the description, e.g. "Service". */
  title: string;
  product: string;
  quantity: number;
  unitPrice: number;
};

export type Invoice = {
  id: string;
  fileName: string;
  number: string;
  /** Multiline free text. First line is used as the header name. */
  from: string;
  /** Multiline free text. */
  to: string;
  items: LineItem[];
  issuedOn: string; // yyyy-mm-dd
  dueBy: string; // yyyy-mm-dd
  createdAt: number;
  updatedAt: number;
};

export function itemTotal(item: LineItem): number {
  const qty = Number.isFinite(item.quantity) ? item.quantity : 0;
  const price = Number.isFinite(item.unitPrice) ? item.unitPrice : 0;
  return qty * price;
}

export function invoiceSubtotal(invoice: Pick<Invoice, "items">): number {
  return invoice.items.reduce((sum, item) => sum + itemTotal(item), 0);
}

export function fromName(invoice: Pick<Invoice, "from">): string {
  return invoice.from.split("\n").map((l) => l.trim()).find(Boolean) ?? "";
}

export function money(value: number): string {
  return `$ ${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
