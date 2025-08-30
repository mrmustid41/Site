import crypto from "crypto";

export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { amount, itemName } = JSON.parse(event.body);

  const MERCHANT_NO = "100001765";
  const SECRET_KEY = "c7372872";

  const requestId = Date.now().toString();
  const orderNo = `order_${requestId}`;
  const orderCurrency = "ZAR";

  // Sign
  const signString = SECRET_KEY + requestId + MERCHANT_NO + orderNo + amount + orderCurrency;
  const sign = crypto.createHash("sha256").update(signString).digest("hex");

  const formData = new URLSearchParams();
  formData.append("version", "2");
  formData.append("requestId", requestId);
  formData.append("merchantNo", MERCHANT_NO);
  formData.append("orderNo", orderNo);
  formData.append("orderAmount", amount);
  formData.append("orderCurrency", orderCurrency);
  formData.append("orderDescription", itemName || "Grow a Garden Pets");
  formData.append("notifyURL", "https://growagardenpets.store/.netlify/functions/coinpal-notify");
  formData.append("redirectURL", "https://growagardenpets.store/success.html");
  formData.append("cancelURL", "https://growagardenpets.store/cancel.html");
  formData.append("sign", sign);

  const response = await fetch("https://pay.coinpal.io/gateway/pay/checkout", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  return {
    statusCode: 200,
    body: JSON.stringify({ paymentUrl: result.data?.checkoutUrl }),
  };
}
