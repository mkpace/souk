import _ from 'lodash';
import { moneyFormat } from '../../common/utils/util';

export default class OrderEmailController {
  static refundOrderInfo(order) {
    const lastRefund = order.refunds[order.refunds.length - 1];
    const subTotal = parseFloat(order.total) - parseFloat(order.shipping_total)
      - parseFloat(order.total_tax);

    let remain = parseFloat(order.total);
    _.each(order.refunds, (refund) => {
      remain -= parseFloat(refund.amount);
    });

    return `
      <table cellpadding="10px" cellspacing="0" border="0" style="border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;">
        <tr>
          <th align="left">Product</th>
          <th align="left">Quantity</th>
          <th align="left">Price</th>
        </tr>
        <tr>
          <td style="border-collapse: collapse;">Partial Order Refund</td>
          <td style="border-collapse: collapse;">N/A</td>
          <td style="border-collapse: collapse;">$${lastRefund.amount}</td>
        </tr>
        <tr>
          <td colspan="2" style="border-collapse: collapse;"><b>Subtotal:</b></td>
          <td style="border-collapse: collapse;">$${moneyFormat(subTotal)}</td>
        </tr>
        <tr>
          <td colspan="2" style="border-collapse: collapse;"><b>Shipping:</b></td>
          <td style="border-collapse: collapse;">$${order.shipping_total}</td>
        </tr>
        <tr>
          <td colspan="2" style="border-collapse: collapse;"><b>Tax:</b></td>
          <td style="border-collapse: collapse;">$${order.total_tax}</td>
        </tr>
        <tr>
          <td colspan="2" style="border-collapse: collapse;"><b>Payment method:</b></td>
          <td style="border-collapse: collapse;">${order.payment_method.toUpperCase()}</td>
        </tr>
        <tr>
          <td colspan="2" style="border-collapse: collapse;"><b>Refund:</b></td>
          <td style="border-collapse: collapse;">-$${lastRefund.amount}</td>
        </tr>
        <tr>
          <td colspan="2" style="border-collapse: collapse;"><b>Total:</b></td>
          <td class="info-color" style="border-collapse: collapse;color: #3498db;"><del>${order.total}</del> ${moneyFormat(remain)}</td>
        </tr>
      </table>
    `;
  }

  static billingInfo(order) {
    const cloned = _.cloneDeep(order);
    let billingInfo = '';

    if (!cloned.billing.company) {
      cloned.billing.company = 'N/A';
    }
    if (!cloned.billing.address_1) {
      cloned.billing.address_1 = 'N/A';
    }
    if (!cloned.billing.city) {
      cloned.billing.city = 'N/A';
    }
    if (!cloned.billing.state) {
      cloned.billing.state = 'N/A';
    }
    if (!cloned.billing.phone) {
      cloned.billing.phone = 'N/A';
    }
    if (!cloned.billing.postcode) {
      cloned.billing.postcode = '';
    }

    billingInfo = `
      <b>${cloned.billing.first_name} ${cloned.billing.last_name}</b><br>
      ${cloned.billing.company}<br>
      ${cloned.billing.address_1}<br>
    `;
    if (cloned.billing.address_2) {
      billingInfo += `${cloned.billing.address_2}<br>`;
    }
    billingInfo += `
      ${cloned.billing.city}, ${cloned.billing.state} ${cloned.billing.postcode}<br>
      ${cloned.billing.country}<br><br>
      ${cloned.billing.phone}<br>
    `;
    if (cloned.billing.email) {
      billingInfo += `<br>${cloned.billing.email}<br>`;
    }

    return billingInfo;
  }
}
