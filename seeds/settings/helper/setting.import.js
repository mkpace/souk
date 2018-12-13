import fs from 'fs';
import path from 'path';
import _ from 'lodash';

import { Setting } from '../../../functions/setting/models/setting.model';

export default class SettingImport {
  static async saveSettingsToDb() {
    console.log('Saving settings to db'); // eslint-disable-line no-console

    const raw = fs.readFileSync(path.resolve(__dirname, '../data/settings.json'));
    const settings = JSON.parse(raw);
    const promises = [];

    await Setting.deleteMany({}); // remove all settings
    _.each(settings, (setting) => {
      promises.push(SettingImport._saveSettingToDb(setting));
    });

    await Promise.all(promises);
    console.log('Finished!'); // eslint-disable-line no-console
  }

  static async _saveSettingToDb(setting) {
    try {
      await Setting.create(setting);
    } catch (err) {
      throw err;
    }
  }
}
