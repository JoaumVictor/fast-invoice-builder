"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SharkLogo } from "@/components/shark-logo";
import { downloadInvoicePdf } from "@/lib/download";
import { deleteInvoice, listInvoices } from "@/lib/storage";
import { Invoice, invoiceSubtotal, money } from "@/lib/types";

export default function HomePage() {
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [toDelete, setToDelete] = useState<Invoice | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    setInvoices(listInvoices().sort((a, b) => b.updatedAt - a.updatedAt));
  }, []);

  function confirmDelete() {
    if (!toDelete) return;
    deleteInvoice(toDelete.id);
    setInvoices((prev) => prev?.filter((inv) => inv.id !== toDelete.id) ?? []);
    setToDelete(null);
  }

  async function handleDownload(invoice: Invoice) {
    setDownloadingId(invoice.id);
    try {
      await downloadInvoicePdf(invoice);
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SharkLogo width={56} className="text-foreground" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Fast Invoice Builder
            </h1>
            <p className="text-sm text-muted-foreground">
              Your invoices, stored locally in this browser.
            </p>
          </div>
        </div>
        <Button size="lg" render={<Link href="/new" />}>
          New invoice
        </Button>
      </div>

      {invoices !== null && invoices.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <SharkLogo width={80} className="text-muted-foreground/40" />
            <p className="text-muted-foreground">
              No invoices yet. Create the first one — the next ones will be
              pre-filled automatically.
            </p>
            <Button render={<Link href="/new" />}>
              Create my first invoice
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {invoices?.map((invoice) => {
          const client = invoice.to.split("\n").find((l) => l.trim()) ?? "—";
          return (
            <Card key={invoice.id}>
              <CardContent className="flex flex-wrap items-center gap-4 py-4">
                <Badge variant="outline" className="font-mono text-sm">
                  #{invoice.number}
                </Badge>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">
                    {invoice.fileName}.pdf
                  </div>
                  <div className="truncate text-sm text-muted-foreground">
                    {client} · {invoice.issuedOn} → {invoice.dueBy}
                  </div>
                </div>
                <div className="font-mono text-sm">
                  {money(invoiceSubtotal(invoice))}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    render={<Link href={`/edit/${invoice.id}`} />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={downloadingId === invoice.id}
                    onClick={() => handleDownload(invoice)}
                  >
                    {downloadingId === invoice.id ? "…" : "PDF"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                    onClick={() => setToDelete(invoice)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete invoice #{toDelete?.number}?</DialogTitle>
            <DialogDescription>
              &quot;{toDelete?.fileName}.pdf&quot; will be removed permanently.
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
