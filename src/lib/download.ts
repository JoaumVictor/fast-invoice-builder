import { Invoice } from "./types";

/** Renders the invoice to a vector PDF and downloads it with the chosen file name. */
export async function downloadInvoicePdf(invoice: Invoice): Promise<void> {
  const [{ pdf }, { InvoicePdf }, React] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/components/invoice-pdf"),
    import("react"),
  ]);

  // pdf() types expect a <Document> element; InvoicePdf renders one.
  const element = React.createElement(InvoicePdf, {
    invoice,
  }) as unknown as Parameters<typeof pdf>[0];
  const blob = await pdf(element).toBlob();

  const name = (invoice.fileName || `invoice-${invoice.number}`).replace(
    /\.pdf$/i,
    ""
  );
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${name}.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);
}
