import _ from 'lodash';

import EmailController from '../../email/controllers/email.controller';
import SettingController from '../../setting/controllers/setting.controller';
import { Cart } from '../../cart/models/cart.model';
import logger from '../../common/utils/logger';

export default class CartSweeperController {
  static async sweep() {
    try {
      const cartPurchaseRemind = SettingController.getSetting('cart-purchase-remind');
      const fromDate = new Date();
      const toDate = new Date();

      fromDate.setDate(fromDate.getDate() - parseInt(cartPurchaseRemind.value, 10) - 1);
      toDate.setDate(toDate.getDate() - parseInt(cartPurchaseRemind.value, 10));

      const carts = await Cart
        .find({
          dt_updated: { $gte: fromDate, $lte: toDate },
          deleted: false,
        })
        .populate('user_id')
        .exec();

      if (carts.length > 0) {
        logger.info(`Send cart reminder emails for ${carts.length} users.`);
        await CartSweeperController._handleElapsedCarts(carts);
      }

      return carts.length;
    } catch (err) {
      throw err;
    }
  }

  static async _handleElapsedCarts(carts) {
    const promises = [];

    _.each(carts, (cart) => {
      promises.push(CartSweeperController._sendReminderNotification(cart));
    });

    await Promise.all(promises);
  }

  static async _sendReminderNotification(cart) {
    try {
      await EmailController.processEmail(
        'Friendly Reminder',
        'cart-purchase-remind',
        {
          name: `${cart.user_id.first_name} ${cart.user_id.last_name}`,
        },
        [cart.user_id.email],
      );
    } catch (err) {
      throw err;
    }
  }
}
