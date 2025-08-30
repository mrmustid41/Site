const crypto = require("crypto");
const fetch = require("node-fetch");

const SECRET_KEY = "your_secret_key";
const MERCHANT_NO = "your_merchant_no";
const API_URL = "https://pay.coinpal.io/gateway/pay";

exports.handler = async (event) => {
  const { amount, item_name, username, email } = JSON.parse(event.body);
  const orderNo = `order_${Date.now()}`;
  const requestId = `req_${Date.now()}`;

  const orderAmount = parseFloat(amount).toFixed(2);
  const orderCurrency = "ZAR";

  const signString = `${SECRET_KEY}${requestId}${MERCHANT_NO}${orderNo}${orderAmount}${orderCurrency}`;
  const sign = crypto.createHash("sha256").update(signString).digest("hex");

  const formData = new URLSearchParams();
  formData.append("version", "2");
  formData.append("requestId", requestId);
  formData.append("merchantNo", MERCHANT_NO);
  formData.append("orderNo", orderNo);
  formData.append("orderAmount", orderAmount);
  formData.append("orderCurrency", orderCurrency);
  formData.append("orderDescription", item_name);
  formData.append("payerEmail", email);
  formData.append("notifyURL", "https://yourdomain.com/notify");
  formData.append("redirectURL", "https://yourdomain.com/redirect");
  formData.append("cancelURL", "https://yourdomain.com/cancel");
  formData.append("sign", sign);

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: formData,
  });

  const data = await response.json();

  if (data.respCode === "200") {
    return {
      statusCode: 200,
      body: JSON.stringify({ payment_url: data.nextStepContent }),
    };
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: data.respMessage }),
    };
  }
};
