// lib/invoice/invoice-template.js

import React from "react";

export default function InvoiceTemplate({ order }) {
  return (
    <html>
      <head>
        <meta charSet="UTF-8" />
        <title>{order.invoiceNumber}</title>

        <style>{`
          *{
            margin:0;
            padding:0;
            box-sizing:border-box;
            font-family:Arial,sans-serif;
          }

          body{
            padding:40px;
            color:#222;
            font-size:14px;
          }

          .header{
            display:flex;
            justify-content:space-between;
            margin-bottom:40px;
          }

          .company h1{
            font-size:28px;
            margin-bottom:5px;
          }

          .company p{
            color:#666;
          }

          .invoice-info{
            text-align:right;
          }

          .section{
            margin:25px 0;
          }

          .section h3{
            margin-bottom:8px;
          }

          table{
            width:100%;
            border-collapse:collapse;
            margin-top:20px;
          }

          th{
            background:#f4f4f4;
          }

          th,
          td{
            border:1px solid #ddd;
            padding:10px;
            text-align:left;
          }

          .totals{
            width:350px;
            margin-left:auto;
            margin-top:30px;
          }

          .totals td:first-child{
            font-weight:bold;
          }

          .footer{
            margin-top:60px;
            text-align:center;
            color:#777;
            font-size:12px;
          }
        `}</style>
      </head>

      <body>

        <div className="header">

          <div className="company">
            <h1>VastraDrobe</h1>
            <p>TAX INVOICE</p>
          </div>

          <div className="invoice-info">
            <p><strong>Invoice:</strong> {order.invoiceNumber}</p>
            <p><strong>Order:</strong> {order.orderNumber}</p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(order.createdAt).toLocaleDateString("en-IN")}
            </p>
          </div>

        </div>

        <div className="section">
          <h3>Bill To</h3>

          <p>{order.deliveryAddress.name}</p>
          <p>{order.deliveryAddress.phone}</p>
          <p>{order.deliveryAddress.email}</p>

          <p>
            {order.deliveryAddress.address}
          </p>

          <p>
            {order.deliveryAddress.city},{" "}
            {order.deliveryAddress.state}{" "}
            {order.deliveryAddress.pincode}
          </p>
        </div>

        <table>

          <thead>

            <tr>
              <th>#</th>
              <th>Product</th>
              <th>SKU</th>
              <th>Color</th>
              <th>Size</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>

          </thead>

          <tbody>

            {order.items.map((item, index) => (

              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.name}</td>
                <td>{item.sku || "-"}</td>
                <td>{item.color}</td>
                <td>{item.size}</td>
                <td>{item.quantity}</td>
                <td>₹{item.price}</td>
                <td>₹{item.total}</td>
              </tr>

            ))}

          </tbody>

        </table>

        <table className="totals">

          <tbody>

            <tr>
              <td>Subtotal</td>
              <td>₹{order.subtotal}</td>
            </tr>

            <tr>
              <td>Shipping</td>
              <td>₹{order.shippingCharge}</td>
            </tr>

            <tr>
              <td>Discount</td>
              <td>-₹{order.discount}</td>
            </tr>

            <tr>
              <td>Tax</td>
              <td>₹{order.tax}</td>
            </tr>

            <tr>
              <td><strong>Grand Total</strong></td>
              <td><strong>₹{order.totalAmount}</strong></td>
            </tr>

          </tbody>

        </table>

        <div className="footer">
          <p>This is a computer generated invoice.</p>
          <p>www.vastradrobe.com</p>
        </div>

      </body>
    </html>
  );
}