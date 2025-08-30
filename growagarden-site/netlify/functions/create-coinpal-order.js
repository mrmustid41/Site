const crypto = require("crypto");
const fetch = require("node-fetch");

// Your CoinPal credentials
const SECRET_KEY = "c7372872";   // Replace with your real secret key
const MERCHANT_NO = "100001765"; // Replace with your real merchant number
const API_URL = "https://pay.coinpal.io/gateway/pay";

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    console.log("Event body:", event.body);
    const { amount, item_name, username, email } = JSON.parse(event.body);

    // Validate inputs
    if (!amount || !email || !username) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields" }) };
    }

    // Format amount with 2 decimals
    const orderAmount = parseFloat(amount).toFixed(2);
    const orderCurrency = "ZAR";

    // Numeric-only unique identifiers
    const now = Date.now();
    const orderNo = `${now}`; // numeric only
    const requestId = `${now}${Math.floor(Math.random() * 1000)}`; // numeric only + random suffix

    // Create signature
    const signString = `${SECRET_KEY}${requestId}${MERCHANT_NO}${orderNo}${orderAmount}${orderCurrency}`;
    const sign = crypto.createHash("sha256").update(signString).digest("hex");

    console.log("Sign string:", signString);
    console.log("Sign:", sign);

    // Build form data
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

    console.log("Form data:", formData.toString());

    // Send request to CoinPal
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: formData,
    });

    // Handle raw response
    const raw = await response.text();
    console.log("Raw CoinPal response:", raw);

    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      return { statusCode: 500, body: JSON.stringify({ error: "CoinPal returned invalid response", raw }) };
    }

    if (data.respCode === "200" && data.data?.checkoutUrl) {
      return { statusCode: 200, body: JSON.stringify({ payment_url: data.data.checkoutUrl }) };
    } else {
      return { statusCode: 400, body: JSON.stringify({ error: data.respMessage || "CoinPal error", result: data }) };
    }

  } catch (err) {
    console.error("Function error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
