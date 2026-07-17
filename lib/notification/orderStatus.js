const User = require("@/models/User");
const sendEmail = require("../email/sendEmail");
const sendSMS = require("../sms/sendSMS");

const STATUS = {
  paid: {
    subject: "Order Confirmed",
    text: "Your order has been confirmed."
  },

  packing: {
    subject: "Order Being Packed",
    text: "Your order is now being packed."
  },

  shipping: {
    subject: "Order Shipped",
    text: "Your order has been shipped."
  },

  delivered: {
    subject: "Order Delivered",
    text: "Your order has been delivered."
  }
};

async function notifyOrderStatus(order) {
  const user = await User.findById(order.userId);

  if (!user) return;

  const config = STATUS[order.status];

  if (!config) return;

  const orderNumber = order._id.toString().slice(-8);

  if (user.email) {
    await sendEmail(
      user.email,
      config.subject,
      `
      <h2>Hello ${user.name}</h2>

      <p>${config.text}</p>

      <p><strong>Order:</strong> #${orderNumber}</p>

      <p>Thanks for shopping with VastraDrobe.</p>
      `
    );
  }

  if (user.phone) {
    await sendSMS(user.phone, {
      VAR1: user.name,
      VAR2: orderNumber,
      VAR3: order.status
    });
  }
}

module.exports = notifyOrderStatus;