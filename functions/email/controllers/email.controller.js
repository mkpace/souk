import _ from 'lodash';
import fs from 'fs';
import handlebars from 'handlebars';
import mongoose from 'mongoose';

import { EmailTemplate } from '../models/email.template.model';
import MgMailer from '../../common/utils/mg-mailer';
import logger from '../../common/utils/logger';

let mailer = null;
const LAYOUT_PATH = './functions/email/layout/layout.html';

export default class EmailController {
  /**
  * Send email notification to group of recipients
  * @param {string} subject
  * @param {string} template Email template's name
  * @param {Object[]} tokens
  * @param {string[]} recipients the list of recipients
  * @param {string} sender Sender email
  */
  static async processEmail(
    subject,
    templateName, // it might be full html content
    tokens,
    recipients,
    from,
    isTemplate = true,
  ) {
    if (!mailer) {
      mailer = new MgMailer({
        apiKey: global.env.MAILGUN_API_KEY,
        domain: global.env.MAILGUN_DOMAIN,
      });
    }

    try {
      let fromEmail = from;
      let mailContent = templateName;

      if (isTemplate) {
        // load email template from database
        const template = await EmailTemplate.findOne({
          name: templateName,
          deleted: false,
        });
        if (!template) {
          throw new Error('Template not found');
        }

        // replace template with tokens
        const templateCompiler = handlebars.compile(template.content);
        mailContent = templateCompiler(tokens);

        if (!fromEmail) {
          fromEmail = template.from ? template.from : global.env.FROM_EMAIL;
        }
      }

      // wrap the layout around the mail content
      const layoutTemplate = fs.readFileSync(LAYOUT_PATH, 'utf8');
      const layoutCompiler = handlebars.compile(layoutTemplate);
      const fullContent = layoutCompiler(
        {
          FRONT_BASE_URL: global.env.FRONT_BASE_URL,
          SOUK_BUCKET_LINK: global.env.SOUK_BUCKET_LINK,
          content: mailContent,
        },
        {
          noEscape: true,
        },
      );

      // send emails to recipients
      const emailPromises = [];
      _.each(recipients, (recipient) => {
        const mailOptions = {
          from: fromEmail,
          to: recipient,
          subject,
          html: fullContent,
        };

        emailPromises.push(mailer.sendMail(mailOptions));
      });

      await Promise.all(emailPromises);
    } catch (err) {
      logger.error(`EmailController: ${err.message}`);
    }
  }

  /**
   * req.body format
   * {
   *    subject: '',
   *    template_name: '',
   *    content: '',
   *    sender_email: '',
   *    recipients: [],
   *    userFilter: {},
   *    tokens: {},
   *    tokenQuery: {},
   * }
   */
  static async send(req, res) {
    try {
      let recipients = req.body.recipients || [];
      if (req.body.userFilter) {
        const users = await await mongoose.model('User').find(
          _.assign(
            req.body.userFilter,
            {
              deleted: false,
            },
          ),
        );
        recipients = _.map(users, 'email');
      }

      // eg. tokenQuery:
      // {model: 'User', query: {email: 'xxx@gmail.com'}, fields: {'name': 'first_name'}}
      const tokens = req.body.tokens || {};
      if (req.body.tokenQuery) {
        const tokenRecord = await mongoose.model(req.body.tokenQuery.model)
          .findOne(
            _.assign(
              req.body.tokenQuery.query,
              {
                deleted: false,
              },
            ),
          );
        if (tokenRecord) {
          _.each(req.body.tokenQuery.fields || {}, (val, key) => {
            tokens[key] = tokenRecord[val];
          });
        }
      }

      await EmailController.processEmail(
        req.body.subject,
        req.body.template_name ? req.body.template_name : req.body.content,
        tokens || {},
        recipients || [],
        req.body.from,
        typeof req.body.template_name !== 'undefined',
      );

      return res.success('success');
    } catch (err) {
      return res.error(err.message);
    }
  }
}
