import { DailyOrder } from '../models/daily-order.model';

export default class DailyOrdersController {
  static async list(req, res) {
    try {
      let dailyOrders;
      if (req.query.from && req.query.to) {
        dailyOrders = await DailyOrder.find(
          {
            date: {
              $gte: new Date(req.query.from),
              $lt: new Date(req.query.to),
            },
          },
        );
      } else {
        dailyOrders = await DailyOrder.find();
      }

      return res.success(dailyOrders);
    } catch (err) {
      return res.error(err.message);
    }
  }
}
