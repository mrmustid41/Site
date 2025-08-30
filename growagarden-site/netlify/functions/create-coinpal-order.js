const crypto = require("crypto");
const fetch = require("node-fetch");

// ✅ Your CoinPal credentials
const SECRET_KEY = "c7372872";
const MERCHANT_NO = "100001765";
const API_URL = "https://pay.coinpal.io/gateway/pay";

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { amount, item_name, username, email } = JSON.parse(event.body);

    // Unique order identifiers
    const orderNo = `order_${Date.now()}`;
    const requestId = `req_${Date.now()}`;

    // Ensure amount has exactly 2 decimals
    const orderAmount = parseFloat(amount).toFixed(2);
    const orderCurrency = "ZAR";

    // 🔑 Correct signature string
    const signString = `${SECRET_KEY}${requestId}${MERCHANT_NO}${orderNo}${orderAmount}${orderCurrency}`;
    const sign = crypto.createHash("sha256").update(signString).digest("hex");

    // Prepare form data
    const formData = new URLSearchParams();
    formData.append("version", "2");
    formData.append("requestId", requestId);
    formData.append("merchantNo", MERCHANT_NO);
    formData.append("orderNo", orderNo);
    formData.append("orderAmount", orderAmount);
    formData.append("orderCurrency", orderCurrency);
    formData.append("orderDescription", item_name || "Grow a Garden Pets");
    formData.append("payerEmail", email);
    formData.append("notifyURL", "https://growagardenpets.store/.netlify/functions/coinpal-notify");
    formData.append("redirectURL", "https://growagardenpets.store/success.html");
    formData.append("cancelURL", "https://growagardenpets.store/cancel.html");
    formData.append("sign", sign);

    // Send request to CoinPal
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: formData,
    });

    const data = await response.json();

    if (data.respCode === "200" && data.data?.checkoutUrl) {
      return {
        statusCode: 200,
        body: JSON.stringify({ payment_url: data.data.checkoutUrl }),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: data.respMessage || "CoinPal error", result: data }),
      };
    }
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
