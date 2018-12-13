import axios from 'axios';
import xml2js from 'xml2js';

import cleanXML from '../../common/utils/clean-xml';

class WaTax {
  static async getRate({
    city,
    postal_code, // eslint-disable-line camelcase
  }) {
    const urlToGet = 'https://webgis.dor.wa.gov/webapi/AddressRates.aspx'
      + `?output=xml&city=${city}&zip=${postal_code}`; // eslint-disable-line camelcase

    try {
      const res = await axios.get(urlToGet);
      let result = await new Promise((resolve, reject) => {
        xml2js.parseString(res.data, (err, parsed) => {
          if (err) {
            return reject(err);
          }

          resolve(parsed);
        });
      });

      result = cleanXML(result);
      return result.response.rate.$;
    } catch (err) {
      throw new Error('Invalid address information provided to tax lookup api.');
    }
  }
}

module.exports = WaTax;
