import axios from 'axios';
import { Base64 } from 'js-base64';

const SHIPSTATION_URL = 'https://ssapi.shipstation.com';

class ShipStation {
  constructor(key, secret) {
    this.basicAuth = Base64.encode(`${key}:${secret}`);
  }

  /**
   * Send order to ShipStation
   */
  async createOrder(order) {
    try {
      const res = await axios.post(
        `${SHIPSTATION_URL}/orders/createorder`,
        order,
        {
          headers: {
            Authorization: `Basic ${this.basicAuth}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return res.data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get the order from ShipStation
   */
  async getOrder(orderId) {
    try {
      const res = await axios.get(
        `${SHIPSTATION_URL}/orders/${orderId}`,
        {
          headers: {
            Authorization: `Basic ${this.basicAuth}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return res.data;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = ShipStation;
