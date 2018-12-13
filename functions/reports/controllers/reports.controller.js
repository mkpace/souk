import _ from 'lodash';
import { parse } from 'json2csv';

import {
  DailyOrder,
} from '../../daily-orders/models/daily-order.model';

export default class ReportsController {
  /**
   * calculate sales inventory
   */
  static _getTally(dailyOrders) {
    const tally = {};
    _.each(dailyOrders, (dailyOrder) => {
      _.forOwn(dailyOrder.products, (val, key) => {
        if (typeof tally[key] === 'undefined') {
          tally[key] = 0;
        }

        tally[key] += parseInt(val, 10);
      });
    });

    return tally;
  }

  /**
   * format for csv
   */
  static _transformToCsv(tally) {
    const jsonDocs = [];
    _.forOwn(tally, (val, key) => {
      jsonDocs.push({
        sku: key,
        count: val,
      });
    });

    const csv = parse(jsonDocs, { fields: ['sku', 'count'] });
    return csv;
  }

  static async getMonthlySalesReport(req, res) {
    if (!req.params.month) {
      return res.error('Invalid month supplied');
    }

    try {
      // fetch daily orders during the specific month
      const today = new Date();
      const yyyy = today.getFullYear();
      const from = new Date(yyyy, req.params.month - 1, 1);
      const to = new Date(yyyy, req.params.month, 0);
      const dailyOrders = await DailyOrder.find(
        {
          date: {
            $gte: from,
            $lte: to,
          },
        },
      );

      const tally = ReportsController._getTally(dailyOrders);
      const csvFileName = `sales-report-${req.params.month}-${yyyy}.csv`;
      const csv = ReportsController._transformToCsv(tally);

      // send csv data stream
      res.setHeader('Content-disposition', `attachment; filename=${csvFileName}`);
      res.set('Content-Type', 'text/csv');
      return res.status(200).send(csv);
    } catch (err) {
      return res.error(err.message);
    }
  }

  static async getPeriodSalesReport(req, res) {
    try {
      // add filter
      const filter = {};
      if (req.query.dateStart) {
        filter.$gte = new Date(req.query.dateStart);
      }
      if (req.query.dateEnd) {
        filter.$lte = new Date(req.query.dateEnd);
      }
      const dailyOrders = await DailyOrder.find({ date: filter });

      const tally = ReportsController._getTally(dailyOrders);
      const csvFileName = `sales-report-${req.query.dateStart}-to-${req.query.dateEnd}.csv`;
      const csv = ReportsController._transformToCsv(tally);

      // send csv data stream
      res.setHeader('Content-disposition', `attachment; filename=${csvFileName}`);
      res.set('Content-Type', 'text/csv');
      return res.status(200).send(csv);
    } catch (err) {
      return res.error(err.message);
    }
  }
}
