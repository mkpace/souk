import axios from 'axios';
import _ from 'lodash';

const UPS_SERVICES = {
  // domestic
  'UPS Next Day Air Early': '14',
  'UPS Next Day Air': '01',
  'UPS Next Day Air Saver': '13',
  'UPS 2nd Day Air A.M.': '59',
  'UPS 2nd Day Air': '02',
  'UPS 3 Day Select': '12',
  'UPS Ground': '03',

  // international
  'UPS Standard': '11',
  'UPS Worldwide Express': '07',
  'UPS Worldwide Express Plus': '54',
  'UPS Worldwide Expedited': '08',
  'UPS Worldwide Saver': '65',
  'UPS Worldwide Express Freight': '96',
  'UPS Today Standard': '82',
  'UPS Today Dedicated Courier': '83',
  'UPS Today Intercity': '84',
  'UPS Today Express': '85',
  'UPS Today Express Saver': '86',
  'UPS Access Point Economy': '70',
};

class UPS {
  constructor(username, password, accessLicenseNumber) {
    this.username = username;
    this.password = password;
    this.accessLicenseNumber = accessLicenseNumber;
  }

  _UPSSecurity() {
    return {
      UsernameToken: {
        Username: this.username,
        Password: this.password,
      },
      ServiceAccessToken: {
        AccessLicenseNumber: this.accessLicenseNumber,
      },
    };
  }

  async validateAddress({
    address1,
    address2,
    city,
    state,
    postal_code, // eslint-disable-line camelcase
    country,
  }) {
    const data = {
      UPSSecurity: this._UPSSecurity(),
      XAVRequest: {
        Request: {
          RequestOption: '1',
        },
        RegionalRequestIndicator: '',
        AddressKeyFormat: {
          ConsigneeName: '',
          AddressLine: [address1, address2 || ''],
          PoliticalDivision2: city,
          PoliticalDivision1: state,
          PostcodePrimaryLow: postal_code,
          CountryCode: country,
        },
      },
    };
    const urlToPost = 'https://onlinetools.ups.com/rest/XAV';

    try {
      const res = await axios.post(urlToPost, data);

      return res.data
              && res.data.XAVResponse
              && res.data.XAVResponse.Response
              && res.data.XAVResponse.Response.ResponseStatus
              && res.data.XAVResponse.Response.ResponseStatus.Description === 'Success';
    } catch (err) {
      throw err;
    }
  }

  async rate({
    address1,
    address2,
    city,
    state,
    country,
    postal_code, // eslint-disable-line camelcase
    weight,
    dim_weight, // eslint-disable-line camelcase
    type,
  }) {
    const addressLines = [address1];
    if (address2) {
      addressLines.push(address2);
    }

    const data = {
      UPSSecurity: this._UPSSecurity(),
      RateRequest: {
        Request: {
          RequestOption: 'Rate',
        },
        Shipment: {
          Shipper: {
            Name: 'Shipper Name',
            Address: {
              AddressLine: addressLines,
              City: city,
              StateProvinceCode: state,
              PostalCode: postal_code,
              CountryCode: country,
            },
          },
          ShipTo: {
            Name: 'Ship To Name',
            Address: {
              AddressLine: addressLines,
              City: city,
              StateProvinceCode: state,
              PostalCode: postal_code,
              CountryCode: country,
            },
          },
          Service: {
            Code: UPS_SERVICES[type],
          },
          Package: {
            PackagingType: {
              Code: '00',
            },
            PackageWeight: {
              UnitOfMeasurement: {
                Code: 'Lbs',
                Description: 'pounds',
              },
              Weight: weight.toString(),
            },
          },
        },
      },
    };

    if (dim_weight) { // eslint-disable-line camelcase
      const dim = dim_weight.split(',');

      data.RateRequest.Shipment.Package.Dimensions = {
        UnitOfMeasurement: {
          Code: 'IN',
          Description: 'inches',
        },
        Length: dim[0],
        Width: dim[1],
        Height: dim[2],
      };
    }
    const urlToPost = 'https://onlinetools.ups.com/rest/Rate';

    try {
      const res = await axios.post(urlToPost, data);
      if (res.data.Fault) {
        throw new Error('No support for the location.');
      }

      return {
        type,
        rate: res.data.RateResponse.RatedShipment.TotalCharges.MonetaryValue,
      };
    } catch (err) {
      throw err;
    }
  }

  /**
   * @param {number} weight weight in lbs
   */
  static _getUPSMailInnovations(weight) {
    if (weight < 1.1) {
      return 10.00;
    }

    if (weight >= 1.1 && weight < 2.0) {
      return 18.00;
    }

    if (weight >= 2.0 && weight < 3.0) {
      return 25.00;
    }

    if (weight >= 3.0 && weight < 4.0) {
      return 30.00;
    }

    return 50.00;
  }

  static retailShippingRates({
    amount,
    country,
    weight,
  }) {
    if (country !== 'US') {
      // international
      return [{
        type: 'UPS Mail Innovations',
        rate: this._getUPSMailInnovations(weight),
      }];
    }

    // domestic
    const rates = [
      {
        type: 'UPS Surepost',
        rate: 5.00,
      },
      {
        type: 'UPS Ground',
        rate: 5.00,
      },
      {
        type: 'UPS 3 Day Select',
        rate: 12.00,
      },
      {
        type: 'UPS 2nd Day Air',
        rate: 16.00,
      },
      {
        type: 'UPS Next Day Air',
        rate: 21.00,
      },
    ];

    if (amount >= 50) {
      rates[0].rate = 0.00;
      rates[1].rate = 0.00;
    }

    return rates;
  }

  async wholesaleShippingRates({
    amount,
    address1,
    address2,
    city,
    state,
    country,
    postal_code, // eslint-disable-line camelcase
    weight,
    dim_weight, // eslint-disable-line camelcase
  }) {
    const options = {
      address1,
      address2,
      city,
      state,
      country,
      postal_code, // eslint-disable-line camelcase
      weight,
      dim_weight, // eslint-disable-line camelcase
    };

    try {
      const services = [
        'UPS Standard',
        'UPS Ground',
        'UPS 3 Day Select',
        'UPS 2nd Day Air',
        'UPS Next Day Air',
      ];

      if (amount > 5000) {
        // offers free shipping for orders over $5000
        return [
          {
            type: 'UPS Ground',
            rate: 0.00,
          },
          {
            type: 'UPS 3 Day Select',
            rate: 0.00,
          },
          {
            type: 'UPS 2nd Day Air',
            rate: 0.00,
          },
          {
            type: 'UPS Next Day Air',
            rate: 0.00,
          },
        ];
      }

      // order amount <= 5000
      const reflect = p => p.then(
        v => ({ v, status: 'fulfilled' }),
        e => ({ e, status: 'rejected' }),
      );
      const ratePromises = [];
      _.each(
        services,
        (service) => {
          ratePromises.push(
            reflect(this.rate(_.assign(options, { type: service }))),
          );
        },
      );
      const rates = await Promise.all(ratePromises);
      const fulfilledRates = _.map(
        _.filter(rates, { status: 'fulfilled' }),
        elem => elem.v,
      );

      // in case shipping rate calculation fails
      if (fulfilledRates.length === 0) {
        return [
          {
            type: 'UPS Ground',
            rate: 5.00,
          },
          {
            type: 'UPS 3 Day Select',
            rate: 12.00,
          },
          {
            type: 'UPS 2nd Day Air',
            rate: 16.00,
          },
          {
            type: 'UPS Next Day Air',
            rate: 25.00,
          },
        ];
      }

      return fulfilledRates;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = UPS;
