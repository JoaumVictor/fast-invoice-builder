"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { InvoiceEditor } from "@/components/invoice-editor";
import { getInvoice } from "@/lib/storage";
import { Invoice } from "@/lib/types";

export default function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    const found = getInvoice(id);
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
