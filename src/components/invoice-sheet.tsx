"use client";

import { useEffect, useRef, useState } from "react";
import { SharkLogo } from "@/components/shark-logo";
import {
  Invoice,
  LineItem,
  fromName,
  invoiceSubtotal,
  itemTotal,
  money,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type InvoiceSheetProps = {
  invoice: Invoice;
  /** When set, every field becomes click-to-edit and changes are reported here. */
  onChange?: (invoice: Invoice) => void;
};

const editableClass =
  "rounded-sm bg-transparent outline-none transition-colors hover:bg-sky-50 focus:bg-sky-50 focus:ring-1 focus:ring-sky-300";

function InlineInput({
  value,
  onValue,
  className,
  align = "left",
  placeholder,
}: {
  value: string;
  onValue?: (value: string) => void;
  className?: string;
  align?: "left" | "right";
  placeholder?: string;
}) {
  if (!onValue) {
    return (
      <span className={cn(align === "right" && "text-right", className)}>
        {value || placeholder}
      </span>
    );
  }
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onValue(e.target.value)}
      className={cn(
        editableClass,
        "w-full min-w-0",
        align === "right" && "text-right",
        className
      )}
    />
  );
}

function InlineTextarea({
  value,
  onValue,
  className,
  placeholder,
}: {
  value: string;
  onValue?: (value: string) => void;
  className?: string;
  placeholder?: string;
}) {
  if (!onValue) {
    return (
      <div className={cn("whitespace-pre-line", className)}>
        {value || placeholder}
      </div>
    );
  }
  const rows = Math.max(2, value.split("\n").length);
  return (
    <textarea
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(e) => onValue(e.target.value)}
      className={cn(editableClass, "w-full resize-none", className)}
    />
  );
}

/**
 * The invoice document itself, rendered as a white A4-like sheet.
 * Layout mirrors the reference PDF: name + "Invoice: NNNN" header,
 * From / To blocks, items table and the Invoice Summary box.
 */
export function InvoiceSheet({ invoice, onChange }: InvoiceSheetProps) {
  const set = onChange
    ? (patch: Partial<Invoice>) => onChange({ ...invoice, ...patch })
    : undefined;

  const setItem = onChange
    ? (id: string, patch: Partial<LineItem>) =>
        onChange({
          ...invoice,
          items: invoice.items.map((item) =>
            item.id === id ? { ...item, ...patch } : item
          ),
        })
    : undefined;

  const subtotal = invoiceSubtotal(invoice);

  return (
    <div className="flex min-h-[1123px] w-[794px] flex-col bg-white px-12 py-10 font-sans text-[13px] leading-relaxed text-neutral-800 shadow-xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="pt-2">
          <SharkLogo width={72} className="mb-3 text-neutral-900" />
          <div className="text-xl font-medium text-neutral-900">
            {fromName(invoice) || "Your name"}
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-baseline justify-end gap-2 text-4xl font-light text-neutral-900">
            <span>Invoice:</span>
            <InlineInput
              value={invoice.number}
              onValue={set && ((v) => set({ number: v }))}
              align="right"
              className="max-w-[160px] text-4xl font-light text-neutral-900"
              placeholder="0001"
            />
          </div>
          <div className="mt-2 flex items-center justify-end gap-1 text-xs text-neutral-500">
            <span>Issued on:</span>
            <InlineInput
              value={invoice.issuedOn}
              onValue={set && ((v) => set({ issuedOn: v }))}
              className="max-w-[90px]"
              placeholder="yyyy-mm-dd"
            />
          </div>
          <div className="mt-0.5 flex items-center justify-end gap-1 text-xs text-neutral-500">
            <span>Due by:</span>
            <InlineInput
              value={invoice.dueBy}
              onValue={set && ((v) => set({ dueBy: v }))}
              className="max-w-[90px]"
              placeholder="yyyy-mm-dd"
            />
          </div>
        </div>
      </div>

      {/* From / To */}
      <div className="mt-12 grid grid-cols-2 gap-10">
        <div>
          <div className="mb-1 font-bold text-neutral-900">From</div>
          <InlineTextarea
            value={invoice.from}
            onValue={set && ((v) => set({ from: v }))}
            placeholder={"Your name\nAddress\nCity\nCountry\nPhone\nTax ID"}
          />
        </div>
        <div>
          <div className="mb-1 font-bold text-neutral-900">To</div>
          <InlineTextarea
            value={invoice.to}
            onValue={set && ((v) => set({ to: v }))}
            placeholder={"Company name\nAddress\nCountry\nEmail"}
          />
        </div>
      </div>

      {/* Items table */}
      <div className="mt-14">
        <div className="grid grid-cols-[1fr_90px_110px_60px_110px] items-center rounded-sm bg-neutral-100 px-3 py-3 text-xs font-bold text-neutral-600">
          <span>Product</span>
          <span className="text-right">Quantity</span>
          <span className="text-right">Unit Price</span>
          <span className="text-right">Tax</span>
          <span className="text-right">Total</span>
        </div>
        {invoice.items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-[1fr_90px_110px_60px_110px] items-center border-b border-neutral-200 px-3 py-4"
          >
            <div className="flex flex-col gap-0.5 pr-4">
              <InlineInput
                value={item.title}
                onValue={setItem && ((v) => setItem(item.id, { title: v }))}
                className="font-bold text-neutral-900"
                placeholder="Service"
              />
              <InlineInput
                value={item.product}
                onValue={setItem && ((v) => setItem(item.id, { product: v }))}
                className="text-xs text-neutral-500"
                placeholder="Service description"
              />
            </div>
            <InlineInput
              value={String(item.quantity)}
              onValue={
                setItem &&
                ((v) => setItem(item.id, { quantity: Number(v) || 0 }))
              }
              align="right"
            />
            <InlineInput
              value={money(item.unitPrice)}
              onValue={
                setItem &&
                ((v) =>
                  setItem(item.id, {
                    unitPrice: Number(v.replace(/[^0-9.]/g, "")) || 0,
                  }))
              }
              align="right"
            />
            <span className="text-right text-neutral-400"></span>
            <span className="text-right">{money(itemTotal(item))}</span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-10 flex justify-end">
        <div className="w-[280px]">
          <div className="flex items-center gap-3 rounded-sm bg-neutral-100 px-4 py-3">
            <svg
              viewBox="0 0 16 16"
              className="h-4 w-4 text-neutral-700"
              fill="currentColor"
              aria-hidden
            >
              <path d="M1 1v13a1 1 0 0 0 1 1h13v-1.5H2.5V1H1zm4 9h1.8v3.5H5V10zm3.2-3H10v6.5H8.2V7zm3.2-3h1.8v9.5h-1.8V4z" />
            </svg>
            <span className="font-bold text-neutral-900">Invoice Summary</span>
          </div>
          <div className="mt-3 space-y-2 px-4 text-neutral-700">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{money(0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total</span>
              <span className="font-medium text-neutral-900">
                {money(subtotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-10 text-right text-xs text-neutral-400">
        1 / 1
      </div>
    </div>
  );
}

/** Fits the fixed-width invoice sheet into whatever container it is given. */
export function ScaledSheet({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      setScale(Math.min(1, el.clientWidth / 794));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          height: 1123 * scale,
        }}
      >
        {children}
      </div>
    </div>
  );
}
