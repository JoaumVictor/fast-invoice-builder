import {
  Document,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import { SHARK_PATHS, SHARK_VIEWBOX } from "@/lib/shark";
import {
  Invoice,
  fromName,
  invoiceSubtotal,
  itemTotal,
  money,
} from "@/lib/types";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#262626",
    paddingHorizontal: 46,
    paddingVertical: 40,
    lineHeight: 1.5,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between" },
  name: { fontSize: 15, color: "#171717", marginTop: 10 },
  invoiceTitle: {
    fontSize: 27,
    color: "#171717",
    lineHeight: 1.2,
    textAlign: "right",
  },
  headerMeta: { fontSize: 8.5, color: "#737373", textAlign: "right" },
  columns: { flexDirection: "row", gap: 40, marginTop: 46 },
  column: { flex: 1 },
  blockLabel: {
    fontFamily: "Helvetica-Bold",
    color: "#171717",
    marginBottom: 3,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginTop: 50,
    borderRadius: 2,
  },
  headerCell: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    color: "#525252",
  },
  row: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  colProduct: { flex: 1 },
  colQty: { width: 65, textAlign: "right" },
  colPrice: { width: 80, textAlign: "right" },
  colTax: { width: 45, textAlign: "right" },
  colTotal: { width: 80, textAlign: "right" },
  summary: { alignSelf: "flex-end", width: 210, marginTop: 36 },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 2,
  },
  summaryLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginTop: 7,
    color: "#404040",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    right: 46,
    fontSize: 8.5,
    color: "#a3a3a3",
  },
});

function Shark({ width }: { width: number }) {
  return (
    <Svg viewBox={SHARK_VIEWBOX} style={{ width, height: (width * 204) / 325 }}>
      {SHARK_PATHS.map((d) => (
        <Path key={d} d={d} fill="#171717" />
      ))}
    </Svg>
  );
}

function ChartIcon() {
  return (
    <Svg viewBox="0 0 16 16" style={{ width: 11, height: 11 }}>
      <Path
        d="M1 1v13a1 1 0 0 0 1 1h13v-1.5H2.5V1H1zm4 9h1.8v3.5H5V10zm3.2-3H10v6.5H8.2V7zm3.2-3h1.8v9.5h-1.8V4z"
        fill="#404040"
      />
    </Svg>
  );
}

export function InvoicePdf({ invoice }: { invoice: Invoice }) {
  const subtotal = invoiceSubtotal(invoice);
  const fromLines = invoice.from.split("\n").filter((l) => l.trim());
  const toLines = invoice.to.split("\n").filter((l) => l.trim());

  return (
    <Document title={invoice.fileName || `Invoice ${invoice.number}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Shark width={54} />
            <Text style={styles.name}>{fromName(invoice)}</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>Invoice: {invoice.number}</Text>
            <Text style={[styles.headerMeta, { marginTop: 6 }]}>
              Issued on: {invoice.issuedOn}
            </Text>
            <Text style={styles.headerMeta}>Due by: {invoice.dueBy}</Text>
          </View>
        </View>

        <View style={styles.columns}>
          <View style={styles.column}>
            <Text style={styles.blockLabel}>From</Text>
            {fromLines.map((line, i) => (
              <Text key={i}>{line}</Text>
            ))}
          </View>
          <View style={styles.column}>
            <Text style={styles.blockLabel}>To</Text>
            {toLines.map((line, i) => (
              <Text key={i}>{line}</Text>
            ))}
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, styles.colProduct]}>Product</Text>
          <Text style={[styles.headerCell, styles.colQty]}>Quantity</Text>
          <Text style={[styles.headerCell, styles.colPrice]}>Unit Price</Text>
          <Text style={[styles.headerCell, styles.colTax]}>Tax</Text>
          <Text style={[styles.headerCell, styles.colTotal]}>Total</Text>
        </View>
        {invoice.items.map((item) => (
          <View key={item.id} style={styles.row}>
            <Text
              style={[
                styles.colProduct,
                { fontFamily: "Helvetica-Bold", color: "#171717" },
              ]}
            >
              {item.product}
            </Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colPrice}>{money(item.unitPrice)}</Text>
            <Text style={styles.colTax}></Text>
            <Text style={styles.colTotal}>{money(itemTotal(item))}</Text>
          </View>
        ))}

        <View style={styles.summary}>
          <View style={styles.summaryHeader}>
            <ChartIcon />
            <Text style={{ fontFamily: "Helvetica-Bold", color: "#171717" }}>
              Invoice Summary
            </Text>
          </View>
          <View style={styles.summaryLine}>
            <Text>Subtotal</Text>
            <Text>{money(subtotal)}</Text>
          </View>
          <View style={styles.summaryLine}>
            <Text>Tax</Text>
            <Text>{money(0)}</Text>
          </View>
          <View style={styles.summaryLine}>
            <Text>Total</Text>
            <Text style={{ color: "#171717" }}>{money(subtotal)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>1 / 1</Text>
      </Page>
    </Document>
  );
}
