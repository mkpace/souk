import path from 'path';
import axios from 'axios';
import fs from 'fs';
import _ from 'lodash';
import Promise from 'bluebird'; // eslint-disable-line

import WooCommerce from '../../lib/woocommerce';
import { Product } from '../../../functions/catalog/models/product.model';
import { User } from '../../../functions/user/models/user.model';
import { Comment } from '../../../functions/comment/models/comment.model';

const config = require('../../config/env');

export default class ProductImport {
  constructor() {
    this.woocommerce = new WooCommerce(config.woocommerce);
    this.products = [];
    this.BASE_URL = 'http://localhost:3000';
    this.woocommerceProducts = ProductImport._loadProductJSON();
    this.woocommerceVariations = ProductImport._loadVariationJSON();
  }

  loadFromJson(fileName) {
    const raw = fs.readFileSync(fileName);
    this.products = JSON.parse(raw);
  }

  async _generateProductJSONFromWoocommerce() {
    try {
      await this.woocommerce.getProducts(100);
      console.log('Imported products, fecthing variations'); // eslint-disable-line
      await this.woocommerce.getProductVariations();
    } catch (err) {
      throw err;
    }
  }

  /**
   * Load Data from google sheet
   */
  async _loadFromSheet() {
    const SHEET = '1aY4yl-sgD4KcApAsQoTmlf8g4bcAICov7SSGPbb5Zwo';
    const TAB = 'item-list';
    const DATA_RANGE = 'B2:L80';
    const URL = `${this.BASE_URL}/sheets?id=${SHEET}&tab=${TAB}&range=${DATA_RANGE}`;
    try {
      const { data: excelData } = await axios.get(URL);
      excelData.forEach((row) => {
        this.products.push({
          category: row[0],
          productName: row[1],
          type: row[2].toLowerCase(),
          variationType: row[3],
          variationValue: row[4],
          description: row[6],
          price: row[7],
          sku: row[9],
          bulkSku: row[10],
        });
      });
    } catch (err) {
      throw err;
    }
  }

  static _loadProductJSON() {
    return JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/products.json')));
  }

  static _loadVariationJSON() {
    return JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/variations.json')));
  }

  /**
   * Fetch variations
   * @param {String[]} variationIds
   */
  _loadVariation(variationIds) {
    return this.woocommerceVariations.filter(variation => variationIds.includes(variation.id));
  }

  static _fetchHrefs(string) {
    const pattern = /<a[^>]*>([^<]+)<\/a>/g;
    const hrefPattern = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/;
    let match;
    const results = [];
    do {
      match = pattern.exec(string);
      if (match) {
        const hrefResult = hrefPattern.exec(match[0]);
        if (!hrefResult[2].startsWith('mailto')) {
          results.push({ href: hrefResult[2], text: match[1] });
        }
      }
    } while (match);
    return results;
  }

  static _parseHTML(string) {
    const results = ProductImport._fetchHrefs(string);
    return results.map((result) => {
      const [title, date, author] = result.text.split('|');
      return {
        url: result.href,
        title: title.trim(),
        date: date && date.trim(),
        author: author && author.trim(),
      };
    });
  }

  async _prepare() {
    await this._loadFromSheet();
    const products = this.products.reduce((result, {
      category, productName, type, sku, bulkSku, description,
    }) => {
      if (result[productName]) return result;
      result[productName] = { // eslint-disable-line no-param-reassign
        category, productName, type, sku, bulkSku, description,
      };
      return result;
    }, {});
    const productDocs = [];
    _.forEach(products, ({
      category, productName, type, sku, bulkSku, description,
    }) => {
      if (type === 'retail') {
        const product = this.woocommerceProducts.find(p => p.name === productName);
        if (product) {
          const productVariations = this._loadVariation(product.variations);
          const rawPotencyResults = product.meta_data.find(data => data.key === '_product_tab_content');
          const rawGlobalContents = product.meta_data.find(data => data.key === '_global_tab_80581_content');

          const potencyResults = rawPotencyResults
            ? ProductImport._parseHTML(rawPotencyResults.value) : [];
          const globalResults = rawGlobalContents
            ? ProductImport._parseHTML(rawGlobalContents.value) : [];

          productDocs.push({
            product_id: product.id,
            name: productName,
            slug: product.slug,
            sku: parentSku,
            categories: [category],
            status: 'published',
            stock_qty: 1000,
            long_description: product.description,
            short_description: product.short_description,
            price: product.price,
            dimensions: product.dimensions,
            weight: product.weight || 0,
            potency_results: potencyResults,
            heavy_metals: globalResults.filter(result => result.title === 'Heavy Metal'),
            pesticides: globalResults.filter(result => result.title === 'Pesticides'),
            type,
            images: product.images.map(image => ({
              caption: image.alt,
              src: image.src,
              alt: image.alt,
              position: image.position,
            })),
            variation_types: product.attributes.map(attribute => ({
              name: attribute.name.toLowerCase(),
              options: attribute.options,
            })),
            variations: productVariations.map(variation => ({
              name: productName,
              slug: product.slug,
              sku: variation.sku,
              stock_qty: 1000,
              long_description: variation.description,
              price: variation.price,
              dimensions: variation.dimensions,
              weight: variation.weight,
              images: [
                {
                  caption: variation.image.alt,
                  src: variation.image.src,
                  alt: variation.image.alt,
                  position: variation.image.position,
                },
              ],
              variation_options: variation.attributes.map(attribute => ({
                name: attribute.name.toLowerCase(),
                option: attribute.option,
              })),
            })),
          });
        }
      } else if (type === 'wholesale') {
        const slug = productName.toString()
          .toLowerCase().replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '')
          .replace(/--+/g, '-')
          .replace(/^-+/, '')
          .replace(/-+$/, '');

        productDocs.push({
          name: productName,
          slug,
          sku,
          categories: category.split(', '),
          status: 'published',
          stock_qty: 1000,
          long_description: description,
          short_description: '',
          price: '1',
          dimensions: {
            length: '1',
            width: '1',
            height: '1',
          },
          weight: 0,
          type,
        });
      }
    });
    return productDocs;
  }

  static async _addProduct(product) {
    if (product.type === 'retail') {
      await Product.create(product);
    }
  }

  static async _addReviews(reviews, product) {
    return Promise.map(
      reviews,
      async (review) => {
        const reviewModel = {
          rating: review.rating,
          comment: review.review,
          product_id: product._id,
          status: review.verified ? 'approved' : 'pending',
        };

        const reviewer = await User.find({ email: review.reviewer_email });
        if (reviewer) {
          reviewModel.user_id = reviewer._id;
          await Comment.create(reviewModel);
        } else {
          console.log(`Reviewer does not exist - ${review.reviewer_email}`); // eslint-disable-line
        }
      },
      { concurrency: 1 },
    );
  }

  async process() {
    try {
      const products = await this._prepare();
      fs.writeFileSync(path.resolve(__dirname, '../data/productDoc.json'), JSON.stringify(products));
    } catch (err) {
      throw err;
    }
  }

  static async importFromJSON() {
    const products = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../data/productDoc.json')),
    );

    await Product.update({}, { $set: { deleted: true } }, { multi: true });
    return Promise.map(
      products,
      async (product) => {
        try {
          await ProductImport._addProduct(product);
        } catch (err) {
          console.log(err); // eslint-disable-line
        }
      },
      { concurrency: 1 },
    );
  }

  async importReviews() {
    const products = await Product.find({ deleted: false });

    return Promise.map(
      products,
      async (product) => {
        const reviews = await this.woocommerce.getProductReviews(product.product_id);
        console.log(`Fetched ${reviews.length} from woocommerce`); // eslint-disable-line no-console
        await ProductImport._addReviews(reviews, product);
        console.log(`Imported ${reviews.length} reviews for Product ${product.name}`); // eslint-disable-line no-console
      },
      { concurrency: 1 },
    );
  }
}
