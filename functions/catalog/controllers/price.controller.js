import _ from 'lodash';

export default class PriceController {
  static res_products_with_additional_prices(req, res, next) { // eslint-disable-line camelcase
    res.products_with_additional_prices = async (products, code = 200) => {
      if (!req.query.type) { // eg. wholesale
        return res.status(code).json(products);
      }

      // typecasts products into Object array
      let productObjArray;
      if (Array.isArray(products)) {
        productObjArray = _.map(products, prod => prod.toObject());
      } else {
        productObjArray = products.toObject();
      }

      await PriceController._addPricesForProducts(req.query.type, productObjArray);
      return res.status(code).json(productObjArray);
    };

    next();
  }

  /**
   * @param {Object} product
   */
  static async _addPriceForSingleProduct(customerType, product) {
    if (customerType === 'wholesale') {
      _.set(product, 'discount_price', parseFloat(product.price) * (1 - product.wholesale_discount));
    }

    // set prices for variations by recursive calls
    if (product.variations) {
      await PriceController._addPricesForProducts(customerType, product.variations);
    }
  }

  /**
   * @param {Array|Object} products
   */
  static async _addPricesForProducts(customerType, products) {
    try {
      if (Array.isArray(products)) {
        const productPromises = [];
        _.each(products, (prod) => {
          productPromises.push(PriceController._addPriceForSingleProduct(customerType, prod));
        });

        await Promise.all(productPromises);
      } else {
        await PriceController._addPriceForSingleProduct(customerType, products);
      }
    } catch (err) {
      throw err;
    }
  }
}
