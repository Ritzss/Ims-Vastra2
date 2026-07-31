/**
 * invoice-v2.js
 * VastraDrobe (OPC) Private Limited — Tax Invoice Template
 *
 * Renders a single, complete HTML document intended to be consumed by:
 *   await page.setContent(invoiceTemplate(order))
 * and then printed to a single A4 page via Puppeteer's page.pdf().
 *
 * Design intent: Amazon-style compact tax invoice — dense, tabular,
 * print-first. Not a marketing brochure. No React / Tailwind / Bootstrap.
 *
 * ONLY fields from the documented `order` schema are used. No invented fields.
 */

export default function invoiceTemplate(order) {
  // ------------------------------------------------------------------
  // Company constants (not part of order schema — static business info)
  // ------------------------------------------------------------------
  const COMPANY = {
    name: "VastraDrobe India Private Limited",
    tagline: "Premium Indian Fashion",
    addressLines: ["GF-43 Augusta Point", "Golf Course Road", "Gurugram, Haryana 122011"],
    gst: "06AAJCV7065J1ZU",
    pan: "AAJCV7065J",
    email: "support@vastradrobe.com",
    phone: "+91 9910953926",
    website: "https://vastradrobe.com",
    logo: "https://vastradrobe.com/Assets/Images/logoV2.png",
  };

  const PAYMENT_QR = "https://res.cloudinary.com/dwhn5ec09/image/upload/v1785416139/payment-qr_rqzicpz.jpg";
  const WEBSITE_QR = "https://res.cloudinary.com/dwhn5ec09/image/upload/v1785480873/Untitled_zwjazm.svg";

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------

  /** Returns fallback when value is null/undefined/empty string. */
  function safe(value, fallback = "-") {
    if (value === null || value === undefined) return fallback;
    if (typeof value === "string" && value.trim() === "") return fallback;
    return value;
  }

  /** Escapes HTML special characters to prevent broken markup / injection. */
  function escapeHtml(value) {
    if (value === null || value === undefined) return "";
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /** Coerces any value to a finite number, defaulting to 0. */
  function toNumber(value) {
    const n = typeof value === "number" ? value : parseFloat(value);
    return Number.isFinite(n) ? n : 0;
  }

  /** Formats a number as Indian Rupee currency, e.g. ₹1,234.00 */
  function formatCurrency(value) {
    const n = toNumber(value);
    const formatted = n.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `&#8377;${formatted}`;
  }

  /** Formats a date string/Date into "DD MMM YYYY". */
  function formatDate(value) {
    if (!value) return "-";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "-";
    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleString("en-US", { month: "short" });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  }

  /** Maps payment/order status to a small colored badge. */
  function getStatusBadge(status) {
    const s = String(safe(status, "")).toLowerCase();
    let bg = "#666666";
    let label = safe(status, "-");

    if (["paid", "completed", "success", "delivered"].includes(s)) {
      bg = "#1a7a3c";
    } else if (["pending", "processing", "confirmed"].includes(s)) {
      bg = "#b8860b";
    } else if (["failed", "cancelled", "canceled", "returned", "refunded"].includes(s)) {
      bg = "#8B0000";
    }

    return `<span class="badge" style="background:${bg}">${escapeHtml(label).toUpperCase()}</span>`;
  }

  /** Returns an <img> tag for a product if an image URL exists, else empty string. */
  function getProductImage(images) {
    if (!Array.isArray(images) || images.length === 0) return "";
    const url = images[0];
    if (!url || typeof url !== "string" || url.trim() === "") return "";
    return `<img src="${escapeHtml(url)}" alt="" class="prod-img" />`;
  }

  // ------------------------------------------------------------------
  // Derive safe local variables from order
  // ------------------------------------------------------------------
  const items = Array.isArray(order?.items) ? order.items : [];
  const deliveryAddress = order?.deliveryAddress || {};
  const payment = order?.payment || {};

  const invoiceNumber = safe(order?.invoiceNumber);
  const orderNumber = safe(order?.orderNumber);
  const invoiceDate = formatDate(order?.createdAt);
  const paymentStatusBadge = getStatusBadge(order?.paymentStatus || order?.status);

  const rowsHtml = items
    .map((item, idx) => {
      const sku = safe(item?.sku, `VD-${safe(item?.productId, "N/A")}`);
      const imgHtml = getProductImage(item?.image);
      const qty = toNumber(item?.quantity);
      const price = toNumber(item?.price);
      const total = item?.total !== undefined && item?.total !== null ? toNumber(item.total) : qty * price;
      const rowClass = idx % 2 === 0 ? "row-even" : "row-odd";

      return `
        <tr class="${rowClass}">
          <td class="cell-center">${idx + 1}</td>
          <td class="cell-product">
            <div class="prod-cell">
              ${imgHtml}
              <span class="prod-name">${escapeHtml(safe(item?.name))}</span>
            </div>
          </td>
          <td class="cell-center">${escapeHtml(sku)}</td>
          <td class="cell-center">${escapeHtml(safe(item?.color))}</td>
          <td class="cell-center">${escapeHtml(safe(item?.size))}</td>
          <td class="cell-center">${qty}</td>
          <td class="cell-right">${formatCurrency(price)}</td>
          <td class="cell-right cell-bold">${formatCurrency(total)}</td>
        </tr>`;
    })
    .join("");

  const showCodQr = String(safe(order?.paymentMethod, "")).toUpperCase() === "COD";

  const addressBlock = (label, addr, extra = []) => `
    <div class="addr-col">
      <div class="addr-label">${label}</div>
      <div class="addr-name">${escapeHtml(safe(addr?.name))}</div>
      ${extra.map((line) => `<div class="addr-line">${line}</div>`).join("")}
      <div class="addr-line">${escapeHtml(safe(addr?.address))}</div>
      <div class="addr-line">${escapeHtml(safe(addr?.city))}, ${escapeHtml(safe(addr?.state))} ${escapeHtml(safe(addr?.pincode))}</div>
      <div class="addr-line">${escapeHtml(safe(addr?.country))}</div>
      ${addr?.phone ? `<div class="addr-line">Ph: ${escapeHtml(safe(addr?.phone))}</div>` : ""}
      ${addr?.email ? `<div class="addr-line">${escapeHtml(safe(addr?.email))}</div>` : ""}
    </div>`;

  // ------------------------------------------------------------------
  // Full HTML document
  // ------------------------------------------------------------------
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Invoice ${escapeHtml(invoiceNumber)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }

  @page {
    size: A4;
    margin: 10mm 12mm;
  }

  html, body {
    width: 100%;
    height: 100%;
    background: #ffffff;
    color: #1a1a1a;
    font-family: "Segoe UI", Helvetica, Arial, sans-serif;
    font-size: 10.5px;
    line-height: 1.35;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .invoice-wrap {
    width: 100%;
  }

  /* ---------- TOP PAYMENT QR BANNER ---------- */
  .top-qr-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #fff8f0;
    border: 1.5px solid #8B0000;
    border-radius: 3px;
    padding: 8px 12px;
    margin-bottom: 8px;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .top-qr-banner img {
    width: 90px;
    height: 90px;
    object-fit: contain;
    border: 1px solid #e5e5e5;
    background: #fff;
    flex-shrink: 0;
  }

  .top-qr-banner .top-qr-text .top-qr-title {
    font-size: 12px;
    font-weight: 700;
    color: #8B0000;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    margin-bottom: 2px;
  }

  .top-qr-banner .top-qr-text .top-qr-sub {
    font-size: 9.5px;
    color: #444;
  }

  /* ---------- HEADER ---------- */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #8B0000;
    padding-bottom: 8px;
    margin-bottom: 10px;
  }

  .company-block { display: flex; gap: 10px; align-items: flex-start; }

  .logo { width: 44px; height: 44px; object-fit: contain; }

  .company-name { font-size: 14px; font-weight: 700; color: #8B0000; }

  .company-tagline { font-size: 9px; color: #666; margin-bottom: 3px; }

  .company-meta { font-size: 9px; color: #444; }
  .company-meta div { margin-bottom: 1px; }

  .invoice-title-block { text-align: right; }

  .invoice-title {
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: #8B0000;
    margin-bottom: 4px;
  }

  .invoice-meta { font-size: 9.5px; color: #333; }
  .invoice-meta div { margin-bottom: 1px; }
  .invoice-meta b { color: #000; }

  .badge {
    display: inline-block;
    color: #fff;
    font-size: 8.5px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 3px;
    letter-spacing: 0.3px;
    margin-top: 3px;
  }

  /* ---------- ADDRESS SECTION ---------- */
  .address-section {
    display: flex;
    gap: 0;
    border: 1px solid #e5e5e5;
    margin-bottom: 10px;
  }

  .addr-col {
    flex: 1;
    padding: 7px 10px;
    border-right: 1px solid #e5e5e5;
  }
  .addr-col:last-child { border-right: none; }

  .addr-label {
    font-size: 8.5px;
    font-weight: 700;
    color: #8B0000;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    margin-bottom: 3px;
  }

  .addr-name { font-size: 10px; font-weight: 700; margin-bottom: 2px; }
  .addr-line { font-size: 9px; color: #444; }

  /* ---------- PRODUCT TABLE ---------- */
  table.items {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 10px;
  }

  table.items thead {
    display: table-header-group;
  }

  table.items thead th {
    background: #8B0000;
    color: #ffffff;
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    padding: 6px 6px;
    text-align: center;
    border: 1px solid #8B0000;
  }

  table.items thead th.th-product { text-align: left; }

  table.items tbody tr {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  table.items td {
    font-size: 9.5px;
    padding: 5px 6px;
    border: 1px solid #e5e5e5;
    vertical-align: middle;
  }

  .row-even { background: #ffffff; }
  .row-odd { background: #f7f7f7; }

  .cell-center { text-align: center; }
  .cell-right { text-align: right; white-space: nowrap; }
  .cell-bold { font-weight: 700; }

  .cell-product { text-align: left; }
  .prod-cell { display: flex; align-items: center; gap: 6px; }
  .prod-img {
    width: 26px;
    height: 26px;
    object-fit: cover;
    border: 1px solid #e5e5e5;
    border-radius: 2px;
    flex-shrink: 0;
  }
  .prod-name { font-size: 9.5px; }

  /* ---------- SUMMARY + PAYMENT ROW ---------- */
  .bottom-section {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }

  .payment-box {
    flex: 1;
    border: 1px solid #e5e5e5;
    padding: 8px 10px;
    font-size: 9.5px;
  }

  .payment-box .section-title {
    font-size: 9px;
    font-weight: 700;
    color: #8B0000;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    margin-bottom: 5px;
  }

  .payment-box .pay-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2px;
  }
  .payment-box .pay-row span:first-child { color: #555; }
  .payment-box .pay-row span:last-child { font-weight: 600; }

  .summary-box {
    width: 260px;
    border: 1px solid #e5e5e5;
    padding: 8px 10px;
    font-size: 9.5px;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    padding: 2px 0;
  }
  .summary-row span:first-child { color: #555; }

  .summary-divider {
    border-top: 1px solid #e5e5e5;
    margin: 4px 0;
  }

  .grand-total-row {
    display: flex;
    justify-content: space-between;
    background: #8B0000;
    color: #fff;
    font-weight: 700;
    font-size: 11px;
    padding: 5px 8px;
    margin: 4px -10px -8px -10px;
    border-radius: 0 0 2px 2px;
  }

  /* ---------- QR SECTION (website QR, bottom of invoice) ---------- */
  .qr-section {
    display: flex;
    align-items: flex-start;
    border: 1px solid #e5e5e5;
    padding: 8px 10px;
    margin-bottom: 8px;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .qr-block {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .qr-block img {
    width: 46px;
    height: 46px;
    object-fit: contain;
    border: 1px solid #e5e5e5;
  }

  .qr-caption { font-size: 8.5px; color: #444; }
  .qr-caption b { display: block; font-size: 9px; color: #1a1a1a; }
  .qr-block-payment .qr-caption b { font-size: 10.5px; }

  /* ---------- FOOTER ---------- */
  .footer {
    text-align: center;
    border-top: 1px solid #e5e5e5;
    padding-top: 6px;
    font-size: 8.5px;
    color: #777;
  }
  .footer div { margin-bottom: 1px; }

  tfoot td {
    padding-top: 4px;
  }
</style>
</head>
<body>
  <div class="invoice-wrap">

    ${
      showCodQr
        ? `<!-- TOP PAYMENT QR BANNER -->
    <div class="top-qr-banner">
      <img src="${escapeHtml(PAYMENT_QR)}" alt="Payment QR" />
      <div class="top-qr-text">
        <div class="top-qr-title">Pay using any UPI App</div>
        <div class="top-qr-sub">Scan this code to complete your Cash on Delivery payment</div>
      </div>
    </div>`
        : ""
    }

    <!-- HEADER -->
    <div class="header">
      <div class="company-block">
        <img class="logo" src="${escapeHtml(COMPANY.logo)}" alt="${escapeHtml(COMPANY.name)}" />
        <div>
          <div class="company-name">${escapeHtml(COMPANY.name)}</div>
          <div class="company-tagline">${escapeHtml(COMPANY.tagline)}</div>
          <div class="company-meta">
            <div>GSTIN: ${escapeHtml(COMPANY.gst)}</div>
            <div>${escapeHtml(COMPANY.website)} &nbsp;|&nbsp; ${escapeHtml(COMPANY.email)}</div>
          </div>
        </div>
      </div>
      <div class="invoice-title-block">
        <div class="invoice-title">TAX INVOICE</div>
        <div class="invoice-meta">
          <div>Invoice #: <b>${escapeHtml(invoiceNumber)}</b></div>
          <div>Order #: <b>${escapeHtml(orderNumber)}</b></div>
          <div>Date: <b>${escapeHtml(invoiceDate)}</b></div>
        </div>
        ${paymentStatusBadge}
      </div>
    </div>

    <!-- ADDRESS SECTION -->
    <div class="address-section">
      <div class="addr-col">
        <div class="addr-label">Sold By</div>
        <div class="addr-name">${escapeHtml(COMPANY.name)}</div>
        ${COMPANY.addressLines.map((l) => `<div class="addr-line">${escapeHtml(l)}</div>`).join("")}
        <div class="addr-line">GSTIN: ${escapeHtml(COMPANY.gst)}</div>
        <div class="addr-line">PAN: ${escapeHtml(COMPANY.pan)}</div>
      </div>
      ${addressBlock("Bill To", deliveryAddress)}
      ${addressBlock("Ship To", deliveryAddress)}
    </div>

    <!-- PRODUCT TABLE -->
    <table class="items">
      <thead>
        <tr>
          <th style="width:4%">#</th>
          <th class="th-product" style="width:30%">Product</th>
          <th style="width:12%">SKU</th>
          <th style="width:10%">Color</th>
          <th style="width:8%">Size</th>
          <th style="width:6%">Qty</th>
          <th style="width:14%">Unit Price</th>
          <th style="width:16%">Total</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <!-- SUMMARY + PAYMENT -->
    <div class="bottom-section">
      <div class="payment-box">
        <div class="section-title">Payment Details</div>
        <div class="pay-row"><span>Payment Method</span><span>${escapeHtml(safe(order?.paymentMethod))}</span></div>
        <div class="pay-row"><span>Payment Status</span><span>${escapeHtml(safe(order?.paymentStatus))}</span></div>
        <div class="pay-row"><span>Transaction ID</span><span>${escapeHtml(safe(order?.transactionId))}</span></div>
        ${payment?.provider ? `<div class="pay-row"><span>Provider</span><span>${escapeHtml(safe(payment?.provider))}</span></div>` : ""}
        ${payment?.paymentId ? `<div class="pay-row"><span>Payment ID</span><span>${escapeHtml(safe(payment?.paymentId))}</span></div>` : ""}
      </div>
      <div class="summary-box">
        <div class="summary-row"><span>Subtotal</span><span>${formatCurrency(order?.subtotal)}</span></div>
        <div class="summary-row"><span>Shipping</span><span>${formatCurrency(order?.shippingCharge)}</span></div>
        <div class="summary-row"><span>Discount</span><span>-${formatCurrency(order?.discount)}</span></div>
        <div class="summary-row"><span>Tax</span><span>${formatCurrency(order?.tax)}</span></div>
        <div class="summary-divider"></div>
        <div class="grand-total-row"><span>Grand Total</span><span>${formatCurrency(order?.totalAmount)}</span></div>
      </div>
    </div>

    <!-- QR SECTION -->
    <div class="qr-section">
      <div class="qr-block">
        <img src="${escapeHtml(WEBSITE_QR)}" alt="Website QR" />
        <div class="qr-caption"><b>Scan to Visit</b>VastraDrobe.com</div>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer">
      <div>Thank you for shopping with VastraDrobe</div>
      <div>${escapeHtml(COMPANY.email)} &nbsp;|&nbsp; www.vastradrobe.com</div>
      <div>This is a computer generated invoice. No signature required.</div>
    </div>

  </div>
</body>
</html>`;
}