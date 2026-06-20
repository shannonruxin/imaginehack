const axios = require("axios");

const API_URL = process.env.PLATFORM_API_URL || "http://localhost:8000";

async function isTrackedClient(number) {
  try {
    const resp = await axios.get(`${API_URL}/clients/exists`, {
      params: { number },
      timeout: 5000,
    });
    return resp.data.exists === true;
  } catch {
    return false;
  }
}

module.exports = { isTrackedClient };
