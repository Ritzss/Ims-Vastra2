const AUTH_KEY = process.env.MSG91_AUTH_KEY;
const FLOW_ID = process.env.MSG91_ORDER_STATUS_FLOW_ID;

async function sendSMS(mobile, variables) {
  const res = await fetch("https://control.msg91.com/api/v5/flow/", {
    method: "POST",
    headers: {
      authkey: AUTH_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      flow_id: FLOW_ID,
      sender: "VSTRDB",
      mobiles: `91${mobile}`,
      ...variables,
    }),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return await res.json();
}

module.exports = sendSMS;