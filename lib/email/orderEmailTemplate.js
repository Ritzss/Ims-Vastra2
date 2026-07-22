// import { Transaction } from "mongodb";
// import {Transaction} from "@/models/index";

// import { Transaction } from "@/models";

export function getOrderEmailTemplate(order, transaction) {
  const statusConfig = {
    pending: {
      color: "#f59e0b",
      icon: "⏳",
      title: "Your order has been placed!",
      message:
        "We've received your order and will begin processing it shortly.",
    },

    paid: {
      color: "#2563eb",
      icon: "💳",
      title: "Payment Received",
      message: "We've successfully received your payment.",
    },

    packing: {
      color: "#7c3aed",
      icon: "📦",
      title: "We're packing your order",
      message: "Our warehouse team is carefully packing your items.",
    },

    shipped: {
      color: "#16a34a",
      icon: "🚚",
      title: "Your order is on its way",
      message: "Your parcel has been handed over to our delivery partner.",
    },

    out_for_delivery: {
      color: "#ea580c",
      icon: "🛵",
      title: "Out for Delivery",
      message: "Your package will reach you today.",
    },

    delivered: {
      color: "#059669",
      icon: "🎉",
      title: "Order Delivered",
      message: "We hope you love your purchase!",
    },

    cancelled: {
      color: "#dc2626",
      icon: "❌",
      title: "Order Cancelled",
      message: "Your order has been cancelled.",
    },

    refunded: {
      color: "#6b7280",
      icon: "💰",
      title: "Refund Processed",
      message: "Your refund has been initiated.",
    },
  };

  const current = statusConfig[order.status] || statusConfig.pending;

  // const transaction = await Transaction.findById(order.transactionId);

  const products = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #eee;">
          ${
            item.image?.[0]
              ? `<img src="${item.image[0]}" width="70" style="border-radius:8px;" />`
              : ""
          }
        </td>

        <td style="padding:12px;border-bottom:1px solid #eee;">
          <strong>${item.name}</strong><br>
          ${item.color || ""} ${item.size || ""}<br>
          Qty : ${item.quantity}
        </td>

        <td style="padding:12px;border-bottom:1px solid #eee;text-align:right;">
          ₹${item.price}
        </td>
      </tr>
    `,
    )
    .join("");

  return `
<!DOCTYPE html>
<html>

<body style="margin:0;background:#f5f5f5;font-family:Arial">

<table width="100%" cellpadding="30">

<tr>

<td align="center">

<table width="650" style="background:white;border-radius:14px;overflow:hidden">

<tr>
<td
style="
background:${current.color};
padding:35px;
text-align:center;
color:white;
">

<h1 style="margin:0">
${current.icon}
</h1>

<h2 style="margin:10px 0 0">
${current.title}
</h2>

</td>
</tr>

<tr>
<td style="padding:35px">

<h2>Hello ${order.deliveryAddress.name},</h2>

<p>${current.message}</p>

<hr>

<h3>Order Details</h3>

<table width="100%">

<tr>

<td>
Order Number
</td>

<td align="right">
<b>${order.orderNumber}</b>
</td>

</tr>

<tr>

<td>Status</td>

<td align="right">

<span
style="
background:${current.color};
padding:6px 12px;
border-radius:20px;
color:white;
">

${order.status}

</span>

</td>

</tr>

<tr>

<td>Total</td>

<td align="right">

<b>₹${order.totalAmount}</b>

</td>

</tr>

</table>

<hr>

<h3>Products</h3>

<table width="100%">
${products}
</table>

<hr>

<h3>Delivery Address</h3>

<p>

${order.deliveryAddress.name}<br>

${order.deliveryAddress.address}<br>


</p>

${
  ((order.paymentMethod !== "COD" && order.status === "delivered") ||
    (order.paymentMethod === "COD" && order.status === "paid")) &&
  transaction?.invoiceUrl
    ? `
<hr>

<div style="text-align:center">

<h2>🧾 Invoice Ready</h2>

<p>Your tax invoice is ready.</p>

<a
href="${process.env.NEXT_PUBLIC_SITE_URL}${transaction.invoiceUrl}"
style="
display:inline-block;
padding:14px 28px;
background:#889551;
color:white;
text-decoration:none;
border-radius:8px;
font-weight:bold;
">

Download Invoice

</a>

</div>
`
    : ""
}

<hr>

<div style="text-align:center">

<a
href="https://vastradrobe.com"

style="
display:inline-block;
padding:14px 30px;
background:#889551;
color:white;
text-decoration:none;
border-radius:8px;
font-weight:bold;
">

Continue Shopping

</a>

</div>

<br>

<p style="font-size:13px;color:#777;text-align:center">

Need help?<br>

support@vastradrobe.com

</p>

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>

</html>
`;
}
