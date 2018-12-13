import fs from 'fs';
import path from 'path';
import Promise from 'bluebird'; // eslint-disable-line import/no-extraneous-dependencies
import WooCommerceAPI from 'woocommerce-api'; // eslint-disable-line import/no-extraneous-dependencies
import logger from '../../functions/common/utils/logger';

const USER_ROLES = {
  all: 'all',
  administrator: 'administrator',
  wholesale: 'wholesale_customer2',
  // affiliate: 'wpam_affiliate',
  affiliate: 'affiliate',
  discount: 'discount',
  discount_rejected: 'discount_rejected',
  employee: 'employee',
  lifetime_giveaway: 'lifetime_giveaway',
  by_brad: 'referred_by_brad',
  by_david: 'referred_by_david',
  rejected: 'wwlc_rejected',
  sales_rep: 'sales_rep',
  subscriber: 'subscriber',
  unapproved: 'wwlc_unapproved',
  unmoderated: 'wwlc_unmoderated',
};

export default class WooCommerce {
  constructor(options) {
    this.options = options;
    this.wooCommerce = null;
    this.init();
  }

  /**
   * Initialize the WooCommerce configuration
   * @private
   */
  init() {
    this.wooCommerce = new WooCommerceAPI({
      url: `https://${this.options.domain}`,
      consumerKey: this.options.wc_consumer_key,
      consumerSecret: this.options.wc_consumer_secret,
      wpAPI: true,
      version: 'wc/v2',
    });
  }

  _format() {
    this.totalPages = -1;
    this.total = -1;
    this.dataArray = [];
  }

  /**
   * Get customers for supplied page count
   *
   * @param {any} pages
   */
  async getCustomers({ role, saveToJSON = true, offset = 0 }) {
    try {
      this._format();
      let responseData;

      let start = offset;
      do {
        const action = {
          url: `customers?per_page=100&role=${USER_ROLES[role]}&offset=${start}&orderby=registered_date`,
        };

        responseData = await this._getData(action); // eslint-disable-line no-await-in-loop
        logger.info(`Fetching ${responseData.length} users`); // eslint-disable-line no-console
        start += responseData.length;

        this.dataArray = [...this.dataArray, ...responseData];
      } while (start < this.total);

      if (saveToJSON) {
        this._writeData('customer', this.dataArray, role);
      }
      return this.dataArray;
    } catch (err) {
      throw err;
    }
  }

  getUserRoles() {
    this.funcName = 'getUserRoles';
    return USER_ROLES;
  }

  /**
   * Get all products.
   *
   *
   * @param {Number} count  Will default to 50 if no argument passed
   * @returns
   */
  getProducts(count = 50) {
    const action = `products?per_page=${count}`;

    return new Promise((resolve, reject) => {
      this.wooCommerce.get(action, (err, data, res) => {
        if (err) {
          reject(err);
        } else {
          this.dataArray = JSON.parse(res);
          this._writeData('product', this.dataArray);

          resolve(this.dataArray);
        }
      });
    });
  }

  /**
   * Get the product variations for the list of
   * products passed in the argument
   *
   * @param {Array} products
   * @returns Promise
   */
  async getProductVariations() {
    const products = this._readFile('product');
    this._format();

    try {
      await Promise.map(
        products,
        async (product) => {
          const action = {
            url: `products/${product.id}/variations`,
          };
          const variations = await this._getData(action);
          this.dataArray = [...this.dataArray, ...variations];
        },
        { concurrency: 1 },
      );
      this._writeData('product', this.dataArray, 'variation');
    } catch (err) {
      throw err;
    }
  }

  async getProductReviews(productId) {
    const action = {
      url: `products/${productId}/reviews`,
    };

    const reviews = this._getData(action);

    return reviews;
  }

  // PRIVATE FUNCTIONS
  /**
   * Generic data fetch function to call the API endpoint
   *
   * @param {Object} action
   */
  _getData(action) {
    const self = this;

    return new Promise((resolve, reject) => {
      this.wooCommerce.get(action.url, (err, data, res) => {
        if (err) {
          return reject(err);
        }

        if (self.totalPages === -1) {
          // set the total number of pages
          self.totalPages = data.headers['x-wp-totalpages'];
        }

        if (self.total === -1) {
          // set the total number of results
          self.total = data.headers['x-wp-total'];
        }

        const responseData = JSON.parse(res);
        resolve(responseData);
      });
    });
  }

  _readFile(category, filename) {
    this.funcName = '_readFile';

    const text = fs.readFileSync(
      path.resolve(__dirname, `../${category}/data/${filename || category}s.json`),
      'utf8',
    );
    return JSON.parse(text);
  }

  _writeData(category, data, filename) {
    this.funcName = '_writeData';

    fs.writeFileSync(
      path.resolve(__dirname, `../${category}/data/${filename || category}s.json`),
      JSON.stringify(data),
      'utf8',
    );
  }
}
