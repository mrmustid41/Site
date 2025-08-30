import crypto from "crypto";

export async function handler(event, context) {
  const body = new URLSearchParams(event.body);
  const merchantNo = body.get("merchantNo");
  const orderNo = body.get("orderNo");
  const orderAmount = body.get("orderAmount");
  const orderCurrency = body.get("orderCurrency");
  const sign = body.get("sign");
  const requestId = body.get("requestId");

  const SECRET_KEY = "c7372872";

  const verifyString = SECRET_KEY + requestId + merchantNo + orderNo + orderAmount + orderCurrency;
  const expectedSign = crypto.createHash("sha256").update(verifyString).digest("hex");

  if (sign === expectedSign) {
    // ✅ Verified payment, you could log it or save it
    console.log("Payment success:", orderNo, orderAmount);
    return { statusCode: 200, body: "success" };
  } else {
    return { statusCode: 400, body: "invalid signature" };
  }
}
