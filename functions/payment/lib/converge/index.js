import axios from 'axios';
import _ from 'lodash';
import xml2js from 'xml2js';

import logger from '../../../common/utils/logger';
import cleanXML from '../../../common/utils/clean-xml';
import CONVERGE_RESPONSE_CODES from './response-code';

class Converge {
  constructor(endpoint, merchantId, userId, pin) {
    this.endpoint = endpoint;
    this.ssl_merchant_id = merchantId;
    this.ssl_user_id = userId;
    this.ssl_pin = pin;
  }

  async _callAPI(xml) {
    try {
      const res = await axios.post(this.endpoint, xml);
      let result = await new Promise((resolve, reject) => {
        logger.info(`Converge raw response. ${res.data}`);
        xml2js.parseString(res.data, (err, parsed) => {
          if (err) {
            return reject(err);
          }

          resolve(parsed);
        });
      });

      result = cleanXML(result);
      if (result.txn.errorCode) {
        throw new Error(result.txn.errorMessage);
      }

      return result;
    } catch (err) {
      throw err;
    }
  }

  async queryStatus(txnId) {
    const xmlTransaction = `xmldata=<txn>\n
                        <ssl_merchant_id>${this.ssl_merchant_id}</ssl_merchant_id>\n
                        <ssl_user_id>${this.ssl_user_id}</ssl_user_id>\n
                        <ssl_pin>${this.ssl_pin}</ssl_pin>\n
                        <ssl_transaction_type>txnquery</ssl_transaction_type>\n
                        <ssl_transaction_id>${txnId}</ssl_transaction_id>\n
                      </txn>\n`;
    try {
      const res = await this._callAPI(xmlTransaction);

      return res;
    } catch (err) {
      throw err;
    }
  }

  async collectPayment({
    firstName,
    lastName,
    email,
    cardNumber,
    expirationMonth,
    expirationYear,
    cvv,
    amount,
    invoiceNumber,
    customerCode,
    cardholderIp,
    avs, // response object from ccverify
    company,
    phone,
  }) {
    const xmlTransaction = `xmldata=<txn>\n
                        <ssl_add_token>Y</ssl_add_token>\n
                        <ssl_merchant_id>${this.ssl_merchant_id}</ssl_merchant_id>\n
                        <ssl_user_id>${this.ssl_user_id}</ssl_user_id>\n
                        <ssl_pin>${this.ssl_pin}</ssl_pin>\n
                        <ssl_show_form>false</ssl_show_form>\n
                        <ssl_transaction_type>ccsale</ssl_transaction_type>\n
                        <ssl_card_number>${cardNumber}</ssl_card_number>\n
                        <ssl_exp_date>${expirationMonth}${expirationYear}</ssl_exp_date>\n
                        <ssl_amount>${amount}</ssl_amount>\n
                        <ssl_result_format>HTML</ssl_result_format>\n
                        <ssl_cvv2cvc2_indicator>1</ssl_cvv2cvc2_indicator>\n
                        <ssl_cvv2cvc2>${cvv}</ssl_cvv2cvc2>\n
                        <ssl_first_name>${firstName}</ssl_first_name>\n
                        <ssl_last_name>${lastName}</ssl_last_name>\n
                        <ssl_email>${email}</ssl_email>\n
                        <ssl_invoice_number>${invoiceNumber}</ssl_invoice_number>\n
                        <ssl_customer_code>${customerCode}</ssl_customer_code>\n
                        <ssl_cardholder_ip>${cardholderIp}</ssl_cardholder_ip>\n
                        <ssl_avs_response>${avs.ssl_avs_response}</ssl_avs_response>\n
                        <ssl_avs_address>${avs.ssl_avs_address}</ssl_avs_address>\n
                        <ssl_city>${avs.ssl_city}</ssl_city>\n
                        <ssl_state>${avs.ssl_state}</ssl_state>\n
                        <ssl_avs_zip>${avs.ssl_avs_zip}</ssl_avs_zip>\n
                        <ssl_country>${avs.ssl_country}</ssl_country>\n
                        <ssl_company>${company}</ssl_company>\n
                        <ssl_phone>${phone}</ssl_phone>\n
                      </txn>\n`;
    try {
      const res = await this._callAPI(xmlTransaction);

      return res;
    } catch (err) {
      if (err.message.indexOf('The credentials supplied in the authorization request are invalid.') > -1) {
        throw new Error('Sorry, there was a problem with the Payment Processor\'s'
          + ' system. We have notified the Administrator of this issue. '
          + 'Your items have been saved to your cart, please try to place your payment again later.'
          + ' Thank you for your patience.');
      }

      if (err.message.indexOf('The Credit Card Number supplied in the authorization request appears to be invalid.') > -1) {
        throw new Error('The Credit Card Number supplied is invalid.');
      }

      logger.error(`Failed to process payment. Error: ${err.message}`);
      throw err;
    }
  }

  async collectPaymentwithoutCVV({
    firstName,
    lastName,
    email,
    cardNumber,
    expirationMonth,
    expirationYear,
    amount,
  }) {
    const xmlTransaction = `xmldata=<txn>\n
                              <ssl_add_token>Y</ssl_add_token>\n
                              <ssl_merchant_id>${this.ssl_merchant_id}</ssl_merchant_id>\n
                              <ssl_user_id>${this.ssl_user_id}</ssl_user_id>\n
                              <ssl_pin>${this.ssl_pin}</ssl_pin>\n
                              <ssl_show_form>false</ssl_show_form>\n
                              <ssl_transaction_type>ccsale</ssl_transaction_type>\n
                              <ssl_card_number>${cardNumber}</ssl_card_number>\n
                              <ssl_exp_date>${expirationMonth}${expirationYear}</ssl_exp_date>\n
                              <ssl_amount>${amount}</ssl_amount>\n
                              <ssl_result_format>HTML</ssl_result_format>\n
                              <ssl_cvv2cvc2_indicator>0</ssl_cvv2cvc2_indicator>\n
                              <ssl_first_name>${firstName}</ssl_first_name>\n
                              <ssl_last_name>${lastName}</ssl_last_name>\n
                              <ssl_email>${email}</ssl_email>\n
                            </txn>\n`;
    try {
      const res = await this._callAPI(xmlTransaction);

      return res;
    } catch (err) {
      throw err;
    }
  }

  async verifyCard({
    cardNumber,
    expirationMonth,
    expirationYear,
    cvv,
    firstName,
    lastName,
    address,
    city,
    state,
    zip,
    country,
  }) {
    const xmlTransaction = `xmldata=<txn>\n
                              <ssl_merchant_id>${this.ssl_merchant_id}</ssl_merchant_id>\n
                              <ssl_user_id>${this.ssl_user_id}</ssl_user_id>\n
                              <ssl_pin>${this.ssl_pin}</ssl_pin>\n
                              <ssl_transaction_type>ccverify</ssl_transaction_type>\n
                              <ssl_card_number>${cardNumber}</ssl_card_number>\n
                              <ssl_exp_date>${expirationMonth}${expirationYear}</ssl_exp_date>\n
                              <ssl_first_name>${firstName}</ssl_first_name>\n
                              <ssl_last_name>${lastName}</ssl_last_name>\n
                              <ssl_cvv2cvc2>${cvv}</ssl_cvv2cvc2>\n
                              <ssl_avs_address>${address}</ssl_avs_address>\n
                              <ssl_city>${city}</ssl_city>\n
                              <ssl_state>${state}</ssl_state>\n
                              <ssl_avs_zip>${zip}</ssl_avs_zip>\n
                              <ssl_country>${country}</ssl_country>\n
                            </txn>\n`;
    try {
      const res = await this._callAPI(xmlTransaction);

      return res;
    } catch (err) {
      throw err;
    }
  }

  async generateToken({
    firstName,
    lastName,
    email,
    cardNumber,
    expirationMonth,
    expirationYear,
    cvv,
  }) {
    const xmlTransaction = `xmldata=<txn>\n
                              <ssl_add_token>Y</ssl_add_token>\n
                              <ssl_merchant_id>${this.ssl_merchant_id}</ssl_merchant_id>\n
                              <ssl_user_id>${this.ssl_user_id}</ssl_user_id>\n
                              <ssl_pin>${this.ssl_pin}</ssl_pin>\n
                              <ssl_show_form>false</ssl_show_form>\n
                              <ssl_transaction_type>ccgettoken</ssl_transaction_type>\n
                              <ssl_card_number>${cardNumber}</ssl_card_number>\n
                              <ssl_exp_date>${expirationMonth}${expirationYear}</ssl_exp_date>\n
                              <ssl_result_format>HTML</ssl_result_format>\n
                              <ssl_cvv2cvc2_indicator>1</ssl_cvv2cvc2_indicator>\n
                              <ssl_cvv2cvc2>${cvv}</ssl_cvv2cvc2>\n
                              <ssl_first_name>${firstName}</ssl_first_name>\n
                              <ssl_last_name>${lastName}</ssl_last_name>\n
                              <ssl_email>${email}</ssl_email>\n`;
    try {
      const res = await this._callAPI(xmlTransaction);

      return res;
    } catch (err) {
      throw err;
    }
  }

  async collectPaymentByToken({
    token,
    amount,
  }) {
    const xmlTransaction = `xmldata=<txn>\n
                              <ssl_add_token>Y</ssl_add_token>\n
                              <ssl_merchant_id>${this.ssl_merchant_id}</ssl_merchant_id>\n
                              <ssl_user_id>${this.ssl_user_id}</ssl_user_id>\n
                              <ssl_pin>${this.ssl_pin}</ssl_pin>\n
                              <ssl_show_form>false</ssl_show_form>\n
                              <ssl_transaction_type>ccsale</ssl_transaction_type>\n
                              <ssl_amount>${amount}</ssl_amount>\n
                              <ssl_result_format>HTML</ssl_result_format>\n
                              <ssl_get_token>Y</ssl_get_token>\n
                              <ssl_token>${token}</ssl_token>\n
                            </txn>\n`;
    try {
      const res = await this._callAPI(xmlTransaction);

      return res;
    } catch (err) {
      throw err;
    }
  }

  async refundPayment({
    transactionId,
    amount,
  }) {
    const xmlTransaction = `xmldata=<txn>\n
                              <ssl_transaction_type>ccreturn</ssl_transaction_type>\n
                              <ssl_merchant_id>${this.ssl_merchant_id}</ssl_merchant_id>\n
                              <ssl_user_id>${this.ssl_user_id}</ssl_user_id>\n
                              <ssl_pin>${this.ssl_pin}</ssl_pin>\n
                              <ssl_txn_id>${transactionId}</ssl_txn_id>\n
                              <ssl_amount>${amount}</ssl_amount>\n
                            </txn>\n`;
    try {
      const res = await this._callAPI(xmlTransaction);

      return res;
    } catch (err) {
      throw err;
    }
  }

  static messageDefinition(message) {
    const code = _.find(CONVERGE_RESPONSE_CODES, { message });

    return code ? code.definition : null;
  }
}

module.exports = Converge;
