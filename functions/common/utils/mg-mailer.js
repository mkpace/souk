import mg from 'nodemailer-mailgun-transport';
import nodemailer from 'nodemailer';
import { stubTransport } from 'nodemailer-stub';

import logger from './logger';

export default class MgMailer {
  constructor({
    apiKey,
    domain,
  }) {
    if (apiKey) {
      const auth = {
        auth: {
          api_key: apiKey,
          domain,
        },
      };

      this.stmpTransport = nodemailer.createTransport(mg(auth));
    } else {
      this.stmpTransport = nodemailer.createTransport(stubTransport);
    }
  }

  async sendMail(mailOptions) {
    try {
      logger.info(`Sending email to "${mailOptions.to}" ...`);

      await this.stmpTransport.sendMail(mailOptions);

      logger.info(`Email was sent to "${mailOptions.to}" successfully ...`);
    } catch (err) {
      logger.error(`Failed to send an email to "${mailOptions.to}". Error: ${err.message}`);

      throw err;
    }
  }
}
