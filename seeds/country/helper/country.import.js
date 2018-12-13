import fs from 'fs';
import path from 'path';
import _ from 'lodash';

import { Country } from '../../../functions/country/models/country.model';

export default class CountryImport {
  static async saveCountriesToDb() {
    console.log('Saving countries to db'); // eslint-disable-line no-console

    const raw = fs.readFileSync(path.resolve(__dirname, '../data/countries.json'));
    const countries = JSON.parse(raw);
    const promises = [];

    await Country.remove({}); // remove all countries
    _.each(countries, (country) => {
      promises.push(CountryImport._saveCountryToDb(country));
    });

    await Promise.all(promises);
    console.log('Finished!'); // eslint-disable-line no-console
  }

  static async _saveCountryToDb(country) {
    try {
      await Country.create(country);
    } catch (err) {
      throw err;
    }
  }
}
