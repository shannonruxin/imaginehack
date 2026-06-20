const axios = require("axios");

const API_URL = process.env.PLATFORM_API_URL || "http://localhost:8000";

async function postMessage({ phoneNumber, body, timestamp, direction = "inbound" }) {
  try {
    await axios.post(`${API_URL}/internal/messages`, {
      phone_number: phoneNumber,
      body,
      timestamp,
      direction,
    }, { timeout: 5000 });
  } catch (err) {
    console.error("Failed to post message to platform-api:", err.message);
  }
}

module.exports = { postMessage };
