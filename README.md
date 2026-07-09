# Fast Invoice Builder

A small, local-first app to create professional invoices in seconds. Everything is stored in your browser's `localStorage` — no backend, no accounts, no sync.

## Features

- **Invoice list** — view every invoice you've created, with client, period and total at a glance.
- **Google Forms–style wizard** — answer one question at a time on the left (your details, client details, services, invoice number/period) while the invoice renders live on the right.
- **Smart defaults** — each new invoice pre-fills itself from your last one:
  - From / To / services are copied over automatically.
  - The invoice number increments (`0006` → `0007`, `INV-09` → `INV-10`, etc.).
  - Issue/due dates default to the last day of the previous month and the last day of the current month.
- **Click-to-edit final screen** — after the wizard, the invoice opens full-size; click any field directly on the document to tweak it, set the PDF file name, then save.
- **Vector PDF export** — download any invoice as a real (selectable-text) PDF, named exactly what you typed.
- **Full CRUD** — create, edit, delete, and re-download any saved invoice.
- **Dark theme** throughout, built with shadcn/ui.

## Tech stack

- [Next.js](https://nextjs.org) (App Router, TypeScript)
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) (Base UI primitives)
- [@react-pdf/renderer](https://react-pdf.org) for vector PDF generation
- Browser `localStorage` for persistence — no database, no server state

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # eslint
```

There's also a small dev utility to render a sample invoice straight to a PDF file, without going through the browser:

```bash
npx tsx scripts/render-test.tsx output.pdf
```

## Project structure

```
src/
  app/
    page.tsx           # invoice list (home)
    new/page.tsx        # creation wizard
    edit/[id]/page.tsx  # edit an existing invoice
  components/
    invoice-sheet.tsx   # the on-screen invoice document (view + click-to-edit)
    invoice-editor.tsx  # final screen: file name input, sheet, save/download
    invoice-pdf.tsx      # the same layout, rendered for @react-pdf/renderer
    shark-logo.tsx       # static SVG mark used on the invoice header
    ui/                  # shadcn/ui components
  lib/
    types.ts             # Invoice / LineItem types and money/total helpers
    storage.ts            # localStorage CRUD + smart-default logic
    download.ts            # client-side PDF generation & download
```

## Data model

Invoices are plain objects persisted as a JSON array under one `localStorage` key:

```ts
type Invoice = {
  id: string;
  fileName: string;   // used as the downloaded PDF's file name
  number: string;
  from: string;        // free-form multiline text
  to: string;           // free-form multiline text
  items: LineItem[];    // Product / Quantity / Unit Price (no tax)
  issuedOn: string;      // yyyy-mm-dd
  dueBy: string;         // yyyy-mm-dd
  createdAt: number;
  updatedAt: number;
};
```

Since everything lives in the browser, clearing site data or switching browsers/devices will lose your invoices — there's no export/import yet.
