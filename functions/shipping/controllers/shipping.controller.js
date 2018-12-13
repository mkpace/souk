import _ from 'lodash';

import UPS from '../lib/ups';
import ShipStation from '../lib/shipstation';

export default class ShippingController {
  static _gramToLB(val) {
    const GRAMS_PER_POUND = 0.00220462;
    const lbWeight = Math.ceil(parseFloat(val) * GRAMS_PER_POUND);

    return Math.min(lbWeight, 150.00);
  }

  static _isParamValid(params) {
    let isQueryParamValid = true;

    const REQUIRED_QUERY_PARAMS = [
      'address1',
      'city',
      'state',
      'country',
      'postal_code',
      'weight',
    ];

    _.each(REQUIRED_QUERY_PARAMS, (elem) => {
      if (typeof params[elem] === 'undefined') {
        isQueryParamValid = false;
        return false;
      }
    });

    return isQueryParamValid;
  }

  static _isPOBox(address) {
    if (!address) {
      return false;
    }

    if (
      address.toLowerCase().startsWith('p.o. box')
      || address.toLowerCase().startsWith('p.o.b')
      || address.toLowerCase().startsWith('pob')
      || address.toLowerCase().startsWith('po box')
    ) {
      return true;
    }

    return false;
  }

  static _filterRates(address, rates) {
    if (ShippingController._isPOBox(address)) {
      return _.filter(rates, rate => rate.type === 'UPS Ground');
    }

    return rates;
  }

  static async getRate(req, res) {
    const ups = new UPS(
      global.env.UPS_USERNAME,
      global.env.UPS_PASSWORD,
      global.env.UPS_ACCESS_LICENSE_NO,
    );

    try {
      const type = req.query.type ? req.query.type : 'retail';

      if (type === 'retail') {
        // shipping rates for retail customers
        const rates = UPS.retailShippingRates({
          amount: req.query.amount || 0,
          country: req.query.country || 'US',
          weight: ShippingController._gramToLB(req.query.weight || 0),
        });
        return res.success(ShippingController._filterRates(req.query.address1, rates));
      }

      // shipping rates for wholesale customers
      if (!ShippingController._isParamValid(req.query)) {
        return res.error('Missing required params');
      }
      const rates = await ups.wholesaleShippingRates({
        amount: req.query.amount || 0,
        address1: req.query.address1,
        address2: req.query.address2,
        city: req.query.city,
        state: req.query.state,
        country: req.query.country,
        postal_code: req.query.postal_code,
        weight: ShippingController._gramToLB(req.query.weight || 0),
        dim_weight: req.query.dim_weight,
      });

      return res.success(ShippingController._filterRates(req.query.address1, rates));
    } catch (err) {
      return res.error(err.message);
    }
  }

  static async sendOrderToShipStation(req, res) {
    const shipstation = new ShipStation(
      global.env.SHIPSTATION_API_KEY,
      global.env.SHIPSTATION_API_SECRET,
    );

    try {
      const data = await shipstation.createOrder(req.body);

      return res.success(data);
    } catch (err) {
      return res.error(err.message);
    }
  }

  static async getOrderFromShipStation(req, res) {
    if (!req.params.id) {
      return res.error('Invalid id supplied');
    }

    const shipstation = new ShipStation(
      global.env.SHIPSTATION_API_KEY,
      global.env.SHIPSTATION_API_SECRET,
    );

    try {
      const data = await shipstation.getOrder(req.params.id);
      if (!data) {
        return res.error('Item with id not found', 404);
      }

      return res.success(data);
    } catch (err) {
      return res.error(err.message);
    }
  }

  static async validateAddress(data) {
    const ups = new UPS(
      global.env.UPS_USERNAME,
      global.env.UPS_PASSWORD,
      global.env.UPS_ACCESS_LICENSE_NO,
    );

    try {
      await ups.validateAddress({
        address1: data.address1 || '',
        address2: data.address2 || '',
        city: data.city || '',
        state: data.state || '',
        postal_code: data.postal_code || '',
        country: data.country || '',
      });

      return true;
    } catch (err) {
      throw new Error('Invalid address');
    }
  }
}
