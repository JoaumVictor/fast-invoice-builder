"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InvoiceSheet } from "@/components/invoice-sheet";
import { downloadInvoicePdf } from "@/lib/download";
import { saveInvoice } from "@/lib/storage";
import { Invoice } from "@/lib/types";

/**
 * Full-screen final editing view: required file name input above the sheet,
 * click-to-edit fields on the invoice itself, and a save button below.
 */
export function InvoiceEditor({
  initial,
  backLabel,
  onBack,
}: {
  initial: Invoice;
  backLabel?: string;
  onBack?: () => void;
}) {
  const router = useRouter();
  const [invoice, setInvoice] = useState(initial);
  const [downloading, setDownloading] = useState(false);
  const fileNameMissing = !invoice.fileName.trim();

  function handleSave() {
    if (fileNameMissing) return;
    saveInvoice({ ...invoice, updatedAt: Date.now() });
    router.push("/");
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      await downloadInvoicePdf(invoice);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-[860px] flex-col gap-6 px-6 py-8">
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <Label htmlFor="fileName" className="mb-2 block">
            PDF file name <span className="text-red-400">*</span>
          </Label>
          <Input
            id="fileName"
            value={invoice.fileName}
            onChange={(e) => setInvoice({ ...invoice, fileName: e.target.value })}
            placeholder={`invoice-${invoice.number}`}
            aria-invalid={fileNameMissing}
          />
        </div>
        <span className="pb-2 text-sm text-muted-foreground">.pdf</span>
      </div>

      <p className="text-sm text-muted-foreground">
        Click any field on the invoice to edit it.
      </p>

      <div className="overflow-x-auto rounded-md">
        <InvoiceSheet invoice={invoice} onChange={setInvoice} />
      </div>

      <div className="flex items-center justify-between gap-3 pb-8">
        {onBack ? (
          <Button variant="ghost" onClick={onBack}>
            {backLabel ?? "Back"}
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={downloading || fileNameMissing}
          >
            {downloading ? "Generating…" : "Download PDF"}
          </Button>
          <Button onClick={handleSave} disabled={fileNameMissing}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
