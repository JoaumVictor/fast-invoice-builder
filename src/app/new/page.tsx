"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InvoiceEditor } from "@/components/invoice-editor";
import { InvoiceSheet, ScaledSheet } from "@/components/invoice-sheet";
import { newItem, smartDraft } from "@/lib/storage";
import { Invoice, LineItem, itemTotal, money } from "@/lib/types";

const STEPS = [
  "Confirm your details",
  "Confirm the client's details",
  "Services",
  "Invoice number & period",
] as const;

export default function NewInvoicePage() {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [step, setStep] = useState(0);
  const [finalizing, setFinalizing] = useState(false);

  // smartDraft reads localStorage, so it must run on the client only.
  useEffect(() => {
    setInvoice(smartDraft());
  }, []);

  if (!invoice) return null;

  if (finalizing) {
    return (
      <InvoiceEditor
        initial={invoice}
        backLabel="Back to questions"
        onBack={() => setFinalizing(false)}
      />
    );
  }

  const set = (patch: Partial<Invoice>) => setInvoice({ ...invoice, ...patch });

  const setItem = (id: string, patch: Partial<LineItem>) =>
    set({
      items: invoice.items.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    });

  const setServiceCount = (count: number) => {
    const n = Math.max(1, Math.min(20, count));
    const items = [...invoice.items];
    while (items.length < n) items.push(newItem());
    set({ items: items.slice(0, n) });
  };

  const isLast = step === STEPS.length - 1;

  return (
    <div className="mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-[440px_1fr]">
      {/* Questions */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← All invoices
          </Link>
          <span className="text-sm text-muted-foreground">
            Step {step + 1} of {STEPS.length}
          </span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{STEPS[step]}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {step === 0 && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="from">
                  Your details — one piece of information per line (name first)
                </Label>
                <Textarea
                  id="from"
                  autoFocus
                  rows={7}
                  value={invoice.from}
                  onChange={(e) => set({ from: e.target.value })}
                  placeholder={
                    "Alex Morgan\n123 Maple Street, Apt 4\n10001 New York\nUnited States\n+1 555 123 4567\nTax ID 00-0000000"
                  }
                />
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="to">
                  Client details — one piece of information per line
                </Label>
                <Textarea
                  id="to"
                  autoFocus
                  rows={6}
                  value={invoice.to}
                  onChange={(e) => set({ to: e.target.value })}
                  placeholder={
                    "Acme Studios LLC\n500 Market Avenue\nSan Francisco, CA 94103\nUnited States\nbilling@acmestudios.com"
                  }
                />
              </div>
            )}

            {step === 2 && (
              <>
                <div className="flex items-center gap-3">
                  <Label htmlFor="count" className="shrink-0">
                    How many services?
                  </Label>
                  <Input
                    id="count"
                    type="number"
                    min={1}
                    max={20}
                    className="w-20"
                    value={invoice.items.length}
                    onChange={(e) => setServiceCount(Number(e.target.value))}
                  />
                </div>
                {invoice.items.map((item, i) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 rounded-md border p-4"
                  >
                    <div className="text-sm font-medium text-muted-foreground">
                      Service {i + 1}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor={`product-${item.id}`}>Product</Label>
                      <Input
                        id={`product-${item.id}`}
                        value={item.product}
                        onChange={(e) =>
                          setItem(item.id, { product: e.target.value })
                        }
                        placeholder="Service (202X)"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor={`qty-${item.id}`}>Quantity</Label>
                        <Input
                          id={`qty-${item.id}`}
                          type="number"
                          min={0}
                          value={item.quantity}
                          onChange={(e) =>
                            setItem(item.id, {
                              quantity: Number(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor={`price-${item.id}`}>Unit Price</Label>
                        <CurrencyInput
                          id={`price-${item.id}`}
                          value={item.unitPrice}
                          onValue={(unitPrice) =>
                            setItem(item.id, { unitPrice })
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>Total (no tax)</Label>
                        <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm">
                          {money(itemTotal(item))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {step === 3 && (
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="number">Invoice number</Label>
                  <Input
                    id="number"
                    autoFocus
                    value={invoice.number}
                    onChange={(e) => set({ number: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="issuedOn">From (issued on)</Label>
                  <Input
                    id="issuedOn"
                    type="date"
                    value={invoice.issuedOn}
                    onChange={(e) => set({ issuedOn: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="dueBy">To (due by)</Label>
                  <Input
                    id="dueBy"
                    type="date"
                    value={invoice.dueBy}
                    onChange={(e) => set({ dueBy: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="mt-2 flex justify-between">
              <Button
                variant="ghost"
                disabled={step === 0}
                onClick={() => setStep(step - 1)}
              >
                Back
              </Button>
              {isLast ? (
                <Button onClick={() => setFinalizing(true)}>
                  Final edit →
                </Button>
              ) : (
                <Button onClick={() => setStep(step + 1)}>Next</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live preview */}
      <div className="min-w-0">
        <div className="sticky top-8">
          <ScaledSheet>
            <InvoiceSheet invoice={invoice} />
          </ScaledSheet>
        </div>
      </div>
    </div>
  );
}
