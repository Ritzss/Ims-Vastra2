// lib/invoice/template.js

/**
 * VastraDrobe — Premium Tax Invoice Template
 * -------------------------------------------------------------------------
 * Apple/Amazon/Stripe-inspired luxury minimal design.
 * White background, maroon (#8B0000) accent, soft grey borders, rounded
 * cards, generous spacing. Fully self-contained HTML + embedded CSS.
 * Optimized for Puppeteer -> A4 PDF generation with correct print
 * page-break handling for the product table.
 *
 * Data shape expected on `order`:
 *   order.invoiceNumber
 *   order.orderNumber
 *   order.createdAt
 *   order.items[]            -> { name, sku, color, size, quantity, price, total, image? }
 *   order.deliveryAddress    -> { name, phone, email, address, city, state, pincode }
 *   order.subtotal
 *   order.shippingCharge
 *   order.discount
 *   order.tax
 *   order.totalAmount
 *   order.paymentMethod      (optional)
 *   order.paymentStatus      (optional)
 *   order.transactionId      (optional)
 * -------------------------------------------------------------------------
 */

const COMPANY = {
  name: "VastraDrobe",
  tagline: "Your Morden Indian Wardrobe",
  address: [
    "GF 43, Augusta Point, Golf Course Rd, DLF Phase 5, Gurugram",
    "Haryana - 122011",
    "India",
  ],
  phone: "+91 9910953926",
  email: "support@vastradrobe.com",
  website: "https://vastradrobe.com",
  gst: "06AAICV7065J1ZU",

  logo: "https://vastradrobe.com/Assets/Images/logoV2.png",
};

/* ---------------------------------------------------------------------- */
/* Helpers                                                                */
/* ---------------------------------------------------------------------- */

function safe(value, fallback = "N/A") {
  if (value === null || value === undefined || value === "") return fallback;
  return value;
}

function toNumber(value) {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

function formatCurrency(amount) {
  const num = toNumber(amount);
  return (
    "₹" +
    num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function formatDate(dateInput) {
  if (!dateInput) return "N/A";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getStatusBadge(status) {
  const normalized = (status || "").toString().toLowerCase();
  if (
    normalized === "paid" ||
    normalized === "success" ||
    normalized === "completed"
  ) {
    return { label: "PAID", className: "badge-paid" };
  }
  if (
    normalized === "failed" ||
    normalized === "cancelled" ||
    normalized === "canceled"
  ) {
    return { label: "FAILED", className: "badge-failed" };
  }
  if (
    normalized === "pending" ||
    normalized === "processing" ||
    normalized === ""
  ) {
    return {
      label: normalized ? normalized.toUpperCase() : "PENDING",
      className: "badge-pending",
    };
  }
  return { label: status.toString().toUpperCase(), className: "badge-pending" };
}

function getProductImage(item) {
  try {
    if (item && item.image) {
      if (Array.isArray(item.image) && item.image.length > 0 && item.image[0]) {
        return item.image[0];
      }
      if (typeof item.image === "string" && item.image.trim() !== "") {
        return item.image;
      }
    }
  } catch (e) {
    /* fall through to placeholder */
  }
  return "https://via.placeholder.com/120x120.png?text=No+Image";
}

/* ---------------------------------------------------------------------- */
/* Main Export                                                            */
/* ---------------------------------------------------------------------- */

export default function invoiceTemplate(order) {
  order = order || {};

  const items = Array.isArray(order.items) ? order.items : [];
  const deliveryAddress = order.deliveryAddress || {};

  const invoiceNumber = safe(order.invoiceNumber, "INV-000000");
  const orderNumber = safe(order.orderNumber, "ORD-000000");
  const invoiceDate = formatDate(order.createdAt || Date.now());

  const customerName = safe(deliveryAddress.name);
  const customerPhone = safe(deliveryAddress.phone);
  const customerEmail = safe(deliveryAddress.email, "");
  const customerAddress = safe(deliveryAddress.address);
  const customerCity = safe(deliveryAddress.city, "");
  const customerState = safe(deliveryAddress.state, "");
  const customerPincode = safe(deliveryAddress.pincode, "");

  const paymentStatus = getStatusBadge(order.paymentStatus);

  const subtotal = toNumber(order.subtotal);
  const shipping = toNumber(order.shippingCharge);
  const discount = toNumber(order.discount);
  const tax = toNumber(order.tax);
  const grandTotal = toNumber(
    order.totalAmount !== undefined && order.totalAmount !== null
      ? order.totalAmount
      : subtotal + shipping + tax - discount,
  );

  // const paymentMethod = safe(order.paymentMethod);
  const paymentMethod = safe(order.paymentMethod);
  const transactionId = safe(order.transactionId);
  const qrCodeImage = order.qrCodeImage || null;
  const isCOD =
    (order.paymentMethod || "").toString().trim().toUpperCase() === "COD";
  // const transactionId = safe(order.transactionId);

  /* Build product rows -------------------------------------------------- */

  const productRows = items
    .map((item, index) => {
      const image = getProductImage(item);
      const name = escapeHtml(safe(item.name, "Unnamed Product"));
      const sku = escapeHtml(safe(item.sku, "—"));
      const color = escapeHtml(safe(item.color, "—"));
      const size = escapeHtml(safe(item.size, "—"));
      const quantity = safe(item.quantity, 1);
      const price = toNumber(item.price);
      const lineTotal = toNumber(
        item.total !== undefined && item.total !== null
          ? item.total
          : price * toNumber(quantity || 1),
      );

      return `
              <tr class="product-row">
                <td class="cell cell-index">${index + 1}</td>
                <td class="cell cell-thumb">
                  <img
                    class="thumb-img"
                    src="${escapeHtml(image)}"
                    alt="${name}"
                    onerror="this.onerror=null;this.src='https://via.placeholder.com/120x120.png?text=No+Image';"
                  />
                </td>
                <td class="cell cell-product">
                  <div class="product-name">${name}</div>
                  <div class="product-meta">SKU: ${sku}</div>
                </td>
                <td class="cell cell-center">${color}</td>
                <td class="cell cell-center">${size}</td>
                <td class="cell cell-center">${escapeHtml(quantity)}</td>
                <td class="cell cell-right">${formatCurrency(price)}</td>
                <td class="cell cell-right cell-total">${formatCurrency(lineTotal)}</td>
              </tr>`;
    })
    .join("\n");

  const productTableBody =
    productRows.length > 0
      ? productRows
      : `
              <tr class="product-row">
                <td class="cell cell-empty" colspan="8">No items found for this order.</td>
              </tr>`;

  /* ---------------------------------------------------------------------- */
  /* Full HTML document                                                     */
  /* ---------------------------------------------------------------------- */

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Invoice ${escapeHtml(invoiceNumber)} | ${escapeHtml(COMPANY.name)}</title>
<style>

  /* ==================================================================
     RESET & BASE
     ================================================================== */

  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    width: 100%;
    height: 100%;
  }

  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, 'Segoe UI', sans-serif;
    color: #1a1a1a;
    background-color: #ffffff;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-size: 12px;
    line-height: 1.5;
  }

  /* ==================================================================
     PAGE / PRINT SETUP
     ================================================================== */

  @page {
    size: A4;
    margin: 14mm 12mm 16mm 12mm;
  }

  @media print {
    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      color-adjust: exact;
    }

    .no-print {
      display: none !important;
    }

    .invoice-wrapper {
      padding: 0 !important;
    }

    table {
      page-break-inside: auto;
    }

    thead {
      display: table-header-group;
    }

    tfoot {
      display: table-footer-group;
    }

    tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .card,
    .summary-card,
    .payment-card,
    .footer-section,
    .qr-section {
      page-break-inside: avoid;
      break-inside: avoid;
    }
  }

  /* ==================================================================
     LAYOUT WRAPPER
     ================================================================== */

  .invoice-wrapper {
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    padding: 32px;
    background-color: #ffffff;
  }

  .qr-section {
    margin-top:40px;
    text-align:center;
    border:1px solid #ddd;
    padding:20px;
    border-radius:12px;
}

.qr-section h3 {
    margin-bottom:10px;
}

.qr-image {
    width:180px;
    height:180px;
    object-fit:contain;
    margin-top:15px;
}

  /* ==================================================================
     HEADER
     ================================================================== */

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #8B0000;
    padding-bottom: 28px;
    margin-bottom: 32px;
  }

  .header-left {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .logo-row {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 6px;
  }

  .logo-img {
    width: 56px;
    height: 56px;
    object-fit: contain;
    border-radius: 12px;
  }

  .company-name {
    font-size: 26px;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: #1a1a1a;
  }

  .company-tagline {
    font-size: 11px;
    color: #777777;
    font-style: italic;
    letter-spacing: 0.2px;
  }

  .header-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
  }

  .invoice-title {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: 2px;
    color: #8B0000;
    text-transform: uppercase;
  }

  .status-badge {
    display: inline-block;
    padding: 5px 14px;
    border-radius: 999px;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
  }

  .badge-paid {
    background-color: #e6f4ea;
    color: #1e7e34;
    border: 1px solid #b7dfc2;
  }

  .badge-pending {
    background-color: #fff4e5;
    color: #b26a00;
    border: 1px solid #ffdca8;
  }

  .badge-failed {
    background-color: #fdecea;
    color: #b00020;
    border: 1px solid #f6c1c1;
  }

  .header-meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-end;
    font-size: 11.5px;
    color: #444444;
    margin-top: 6px;
  }

  .header-meta-row {
    display: flex;
    gap: 8px;
  }

  .header-meta-label {
    font-weight: 600;
    color: #888888;
  }

  .header-meta-value {
    font-weight: 700;
    color: #1a1a1a;
  }

  /* ==================================================================
     SELLER / CUSTOMER CARDS
     ================================================================== */

  .party-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 32px;
  }

  .card {
    border: 1px solid #e6e6e6;
    border-radius: 14px;
    padding: 20px 22px;
    background-color: #fbfbfb;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }

  .card-title {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: #8B0000;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #ececec;
  }

  .card-body-name {
    font-size: 14px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 6px;
  }

  .card-line {
    font-size: 11.5px;
    color: #555555;
    margin-bottom: 4px;
    line-height: 1.6;
  }

  .card-line-label {
    color: #999999;
    font-weight: 600;
    margin-right: 4px;
  }

  .cod-qr-section {
    margin-top: 10px;
    padding-top: 12px;
    border-top: 1px dashed #ececec;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    text-align: center;
  }

  .cod-qr-label {
    font-size: 10.5px;
    font-weight: 600;
    color: #8B0000;
  }

  .cod-qr-img {
    width: 130px;
    height: auto;
    border-radius: 10px;
    border: 1px solid #e6e6e6;
  }

  .cod-qr-caption {
    font-size: 9px;
    color: #999999;
  }

  /* ==================================================================
     PRODUCT TABLE
     ================================================================== */

  .section-heading {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: #8B0000;
    margin-bottom: 12px;
  }

  .product-table-wrapper {
    border: 1px solid #e6e6e6;
    border-radius: 14px;
    overflow: hidden;
    margin-bottom: 32px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }

  table.product-table {
    width: 100%;
    border-collapse: collapse;
  }

  table.product-table thead {
    display: table-header-group;
    background-color: #8B0000;
  }

  table.product-table thead th {
    color: #ffffff;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    text-align: left;
    padding: 12px 14px;
  }

  table.product-table thead th.th-center {
    text-align: center;
  }

  table.product-table thead th.th-right {
    text-align: right;
  }

  .product-row {
    page-break-inside: avoid;
    break-inside: avoid;
    border-bottom: 1px solid #f0f0f0;
  }

  .product-row:nth-child(even) {
    background-color: #fafafa;
  }

  .product-row:last-child {
    border-bottom: none;
  }

  .cell {
    padding: 12px 14px;
    font-size: 11.5px;
    color: #333333;
    vertical-align: middle;
  }

  .cell-index {
    width: 28px;
    text-align: center;
    color: #999999;
    font-weight: 600;
  }

  .cell-thumb {
    width: 64px;
  }

  .thumb-img {
    width: 52px;
    height: 52px;
    object-fit: cover;
    border-radius: 10px;
    border: 1px solid #e6e6e6;
    background-color: #f5f5f5;
    display: block;
  }

  .cell-product {
    min-width: 180px;
  }

  .product-name {
    font-weight: 700;
    color: #1a1a1a;
    font-size: 12px;
    margin-bottom: 2px;
  }

  .product-meta {
    font-size: 10px;
    color: #999999;
  }

  .cell-center {
    text-align: center;
  }

  .cell-right {
    text-align: right;
  }

  .cell-total {
    font-weight: 700;
    color: #1a1a1a;
  }

  .cell-empty {
    text-align: center;
    padding: 28px 14px;
    color: #999999;
    font-style: italic;
  }

  /* ==================================================================
     SUMMARY + PAYMENT ROW
     ================================================================== */

  .bottom-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 32px;
  }

  .summary-card {
    border: 1px solid #e6e6e6;
    border-radius: 14px;
    padding: 22px 24px;
    background-color: #fbfbfb;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #444444;
  }

  .summary-row-label {
    color: #777777;
  }

  .summary-row-value {
    font-weight: 600;
    color: #1a1a1a;
  }

  .summary-divider {
    height: 1px;
    background-color: #ececec;
    margin: 8px 0;
  }

  .summary-total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #8B0000;
    border-radius: 10px;
    padding: 14px 16px;
    margin-top: 6px;
  }

  .summary-total-label {
    color: #ffffff;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.4px;
    text-transform: uppercase;
  }

  .summary-total-value {
    color: #ffffff;
    font-size: 18px;
    font-weight: 800;
  }

  .payment-card {
    border: 1px solid #e6e6e6;
    border-radius: 14px;
    padding: 22px 24px;
    background-color: #fbfbfb;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .payment-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11.5px;
    color: #444444;
    border-bottom: 1px dashed #ececec;
    padding-bottom: 8px;
  }

  .payment-row:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .payment-row-label {
    color: #888888;
    font-weight: 600;
  }

  .payment-row-value {
    font-weight: 700;
    color: #1a1a1a;
    text-align: right;
    word-break: break-all;
  }

  /* ==================================================================
     FOOTER + QR SECTION
     ================================================================== */

  .footer-grid {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 20px;
    align-items: flex-end;
    border-top: 2px solid #8B0000;
    padding-top: 24px;
  }

  .footer-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .footer-thankyou {
    font-size: 15px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 4px;
  }

  .footer-line {
    font-size: 11px;
    color: #666666;
  }

  .footer-line strong {
    color: #1a1a1a;
    font-weight: 600;
  }

  .footer-note {
    font-size: 10px;
    color: #aaaaaa;
    font-style: italic;
    margin-top: 8px;
  }

  .qr-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .qr-box {
    width: 96px;
    height: 96px;
    border: 1.5px dashed #cccccc;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fbfbfb;
  }

  .qr-placeholder-text {
    font-size: 9px;
    color: #bbbbbb;
    text-align: center;
    padding: 6px;
    line-height: 1.4;
  }

  .qr-caption {
    font-size: 9.5px;
    color: #999999;
    text-align: center;
  }

</style>
</head>
<body>

  <div class="invoice-wrapper">

    <!-- ============================================================
         HEADER
         ============================================================ -->

    <div class="header">
      <div class="header-left">
        <div class="logo-row">
          <img
            class="logo-img"
            src="${escapeHtml(COMPANY.logo)}"
            alt="${escapeHtml(COMPANY.name)} Logo"
            onerror="this.style.display='none';"
          />
          <div>
            <div class="company-name">${escapeHtml(COMPANY.name)}</div>
            <div class="company-tagline">${escapeHtml(COMPANY.tagline)}</div>
          </div>
        </div>
      </div>

      <div class="header-right">
        <div class="invoice-title">Tax Invoice</div>
        <span class="status-badge ${paymentStatus.className}">${escapeHtml(paymentStatus.label)}</span>

        <div class="header-meta">
          <div class="header-meta-row">
            <span class="header-meta-label">Invoice No:</span>
            <span class="header-meta-value">${escapeHtml(invoiceNumber)}</span>
          </div>
          <div class="header-meta-row">
            <span class="header-meta-label">Order No:</span>
            <span class="header-meta-value">${escapeHtml(orderNumber)}</span>
          </div>
          <div class="header-meta-row">
            <span class="header-meta-label">Date:</span>
            <span class="header-meta-value">${escapeHtml(invoiceDate)}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================
         SELLER + BILL TO CARDS
         ============================================================ -->

    <div class="party-grid">

      <div class="card">
        <div class="card-title">Sold By</div>
        <div class="card-body-name">${escapeHtml(COMPANY.name)}</div>
        <div class="card-line">
          ${(Array.isArray(COMPANY.address) ? COMPANY.address : [COMPANY.address]).map(escapeHtml).join(", ")}
        </div>
        <div class="card-line">
          <span class="card-line-label">GSTIN:</span>${escapeHtml(COMPANY.gst)}
        </div>
        <div class="card-line">
          <span class="card-line-label">Email:</span>${escapeHtml(COMPANY.email)}
        </div>
        <div class="card-line">
          <span class="card-line-label">Web:</span>${escapeHtml(COMPANY.website.replace(/^https?:\/\//, ""))}
        </div>
      </div>

      <div class="card">
        <div class="card-title">Bill To</div>
        <div class="card-body-name">${escapeHtml(customerName)}</div>
        <div class="card-line">${escapeHtml(customerAddress)}</div>
        <div class="card-line">
          ${[customerCity, customerState, customerPincode].filter(Boolean).map(escapeHtml).join(", ")}
        </div>
        <div class="card-line">
          <span class="card-line-label">Phone:</span>${escapeHtml(customerPhone)}
        </div>
        ${customerEmail ? `<div class="card-line"><span class="card-line-label">Email:</span>${escapeHtml(customerEmail)}</div>` : ""}
      </div>

    </div>

    <!-- ============================================================
         PRODUCT TABLE
         ============================================================ -->

    <div class="section-heading">Order Items</div>

    <div class="product-table-wrapper">
      <table class="product-table">
        <thead>
          <tr>
            <th style="width: 28px;">#</th>
            <th style="width: 64px;"></th>
            <th>Product</th>
            <th class="th-center">Color</th>
            <th class="th-center">Size</th>
            <th class="th-center">Qty</th>
            <th class="th-right">Price</th>
            <th class="th-right">Total</th>
          </tr>
        </thead>
        <tbody>
${productTableBody}
        </tbody>
      </table>
    </div>

    <!-- ============================================================
         ORDER SUMMARY  &  PAYMENT DETAILS
         ============================================================ -->

    <div class="bottom-grid">

      <div class="summary-card">
        <div class="section-heading" style="margin-bottom: 4px;">Order Summary</div>

        <div class="summary-row">
          <span class="summary-row-label">Subtotal</span>
          <span class="summary-row-value">${formatCurrency(subtotal)}</span>
        </div>
        <div class="summary-row">
          <span class="summary-row-label">Shipping</span>
          <span class="summary-row-value">${formatCurrency(shipping)}</span>
        </div>
        <div class="summary-row">
          <span class="summary-row-label">Discount</span>
          <span class="summary-row-value">- ${formatCurrency(discount)}</span>
        </div>
        <div class="summary-row">
          <span class="summary-row-label">Tax</span>
          <span class="summary-row-value">${formatCurrency(tax)}</span>
        </div>

        <div class="summary-divider"></div>

        <div class="summary-total-row">
          <span class="summary-total-label">Grand Total</span>
          <span class="summary-total-value">${formatCurrency(grandTotal)}</span>
        </div>
      </div>

      <div class="payment-card">
        <div class="section-heading" style="margin-bottom: 4px;">Payment Details</div>

        <div class="payment-row">
          <span class="payment-row-label">Transaction No.</span>
          <span class="payment-row-value">${escapeHtml(transactionId)}</span>
        </div>
        <div class="payment-row">
          <span class="payment-row-label">Payment Method</span>
          <span class="payment-row-value">${escapeHtml(paymentMethod)}</span>
        </div>
        <div class="payment-row">
          <span class="payment-row-label">Status</span>
          <span class="payment-row-value">
            <span class="status-badge ${paymentStatus.className}">${escapeHtml(paymentStatus.label)}</span>
          </span>
        </div>
        ${
  isCOD
    ? `
<div class="cod-payment-wrapper">

  <div class="cod-info">

    <div class="cod-qr-label">
      Prefer online payment?
    </div>

    <div class="payment-row">
      <span class="payment-row-label">UPI</span>
      <span class="payment-row-value">
        Scan QR to pay
      </span>
    </div>

  </div>


  <div class="cod-qr-section">

    <img 
      class="cod-qr-img"
      src="https://res.cloudinary.com/dwhn5ec09/image/upload/v1785416139/payment-qr_rqzicpz.jpg"
      alt="UPI QR"
    />

    <div class="cod-qr-caption">
      GPay • PhonePe • Paytm • BHIM
    </div>

  </div>

</div>
`
    : ""
}
      </div>
      </div>

    </div>


    <!-- ============================================================
         FOOTER  &  QR CODE SECTION
         ============================================================ -->

    <div class="footer-grid">

      <div class="footer-section">
        <div class="footer-thankyou">Thank you for shopping with ${escapeHtml(COMPANY.name)}!</div>
        <div class="footer-line">
          Need help? Reach us at <strong>${escapeHtml(COMPANY.email)}</strong>
        </div>
        <div class="footer-line">
          Visit us at <strong>${escapeHtml(COMPANY.website.replace(/^https?:\/\//, ""))}</strong>
        </div>
        <div class="footer-note">
          This is a computer generated invoice and does not require a physical signature.
        </div>
      </div>

      <div class="qr-section">
        <div class="qr-box">
          <div class="qr-placeholder-text">QR Code<br/>Coming Soon</div>
        </div>
        <div class="qr-caption">Scan to track order</div>
      </div>

    </div>

  </div>

</body>
</html>`;
}
