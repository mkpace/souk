import fs from 'fs';
import path from 'path';
import _ from 'lodash';

import { EmailTemplate } from '../../../functions/email/models/email.template.model';

export default class TemplateImport {
  static async saveTemplatesToDb() {
    console.log('Saving templates to db'); // eslint-disable-line no-console

    const raw = fs.readFileSync(path.resolve(__dirname, '../data/templates.json'));
    const templates = JSON.parse(raw);
    const promises = [];

    await EmailTemplate.deleteMany({}); // remove all templates
    _.each(templates, (template) => {
      promises.push(TemplateImport._saveTemplateToDb(template));
    });

    await Promise.all(promises);
    console.log('Finished!'); // eslint-disable-line no-console
  }

  static async _saveTemplateToDb(template) {
    try {
      await EmailTemplate.create(template);
    } catch (err) {
      throw err;
    }
  }
}
