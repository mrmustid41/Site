import crypto from "crypto";
import fetch from "node-fetch"; // make sure to install node-fetch in devDependencies

export async function handler(event, context) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { amount, item_name, username, email } = JSON.parse(event.body);

    const MERCHANT_NO = "100001765";
    const SECRET_KEY = "c7372872";

    const requestId = Date.now().toString();
    const orderNo = `order_${requestId}`;
    const orderCurrency = "ZAR";

    const signString = SECRET_KEY + requestId + MERCHANT_NO + orderNo + amount + orderCurrency;
    const sign = crypto.createHash("sha256").update(signString).digest("hex");

    const formData = new URLSearchParams();
    formData.append("version", "2");
    formData.append("requestId", requestId);
    formData.append("merchantNo", MERCHANT_NO);
    formData.append("orderNo", orderNo);
    formData.append("orderAmount", amount);
    formData.append("orderCurrency", orderCurrency);
    formData.append("orderDescription", item_name || "Grow a Garden Pets");
    formData.append("notifyURL", "https://growagardenpets.netlify.app/.netlify/functions/coinpal-notify");
    formData.append("redirectURL", "https://growagardenpets.netlify.app/success.html");
    formData.append("cancelURL", "https://growagardenpets.netlify.app/cancel.html");
    formData.append("sign", sign);

    const response = await fetch("https://pay.coinpal.io/gateway/pay/checkout", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!result.data?.checkoutUrl) {
      return { statusCode: 500, body: JSON.stringify({ error: "CoinPal returned no checkout URL", result }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ payment_url: result.data.checkoutUrl }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
