import axios from 'axios'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

export async function checkIsClient(phone) {
  try {
    const { data } = await axios.get(`${BACKEND_URL}/clients/exists`, {
      params: { number: phone },
      timeout: 5000,
    })
    return { exists: Boolean(data?.exists) }
  } catch {
    return { exists: false }
  }
}

module.exports = { checkIsClient }
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
