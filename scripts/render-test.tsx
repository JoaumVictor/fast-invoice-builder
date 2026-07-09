import { renderToFile } from "@react-pdf/renderer";
import React from "react";
import { InvoicePdf } from "../src/components/invoice-pdf";
import type { Invoice } from "../src/lib/types";

const invoice: Invoice = {
  id: "test",
  fileName: "invoice-0010",
  number: "0010",
  from: "Alex Morgan\n123 Maple Street, Apt 4\n10001 New York\nUnited States\n+1 555 123 4567\nTax ID 00-0000000",
  to: "Acme Studios LLC\n500 Market Avenue\nSan Francisco, CA 94103\nUnited States\nbilling@acmestudios.com",
  items: [
    {
      id: "i1",
      product: "Quarterly bonus (Q2 2026)",
      quantity: 1,
      unitPrice: 1350,
    },
  ],
  issuedOn: "2026-06-30",
  dueBy: "2026-07-31",
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

renderToFile(
  React.createElement(InvoicePdf, { invoice }) as never,
  process.argv[2] ?? "test-invoice.pdf"
).then(() => console.log("done"));
