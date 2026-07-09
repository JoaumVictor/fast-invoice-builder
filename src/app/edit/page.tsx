"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { InvoiceEditor } from "@/components/invoice-editor";
import { getInvoice } from "@/lib/storage";
import { Invoice } from "@/lib/types";

function EditInvoiceInner() {
  const params = useSearchParams();
  const id = params.get("id");
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    const found = id ? getInvoice(id) : undefined;
    if (!found) router.replace("/");
    else setInvoice(found);
  }, [id, router]);

  if (!invoice) return null;

  return (
    <InvoiceEditor
      initial={invoice}
      backLabel="← All invoices"
      onBack={() => router.push("/")}
    />
  );
}

export default function EditInvoicePage() {
  return (
    <Suspense>
      <EditInvoiceInner />
    </Suspense>
  );
}
