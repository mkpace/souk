import axios from 'axios';
import { expect } from 'chai';

import { User } from '../../functions/user/models/user.model';
import { MOCK_ADMIN } from '../user/mock';
import {
  MOCK_CUSTOMER,
  UPDATED_MOCK_CUSTOMER,
  MOCK_IMAGE_ENCODED,
} from './mock';

const BASE_URL = 'http://localhost:3000/customer';

/*
 * tests begin
 */
describe('Customer API', async () => {
  let customerId;
  let authToken;

  /**
   * create a test product
   */
  before(async () => {
    await User.deleteMany({});
    await User.create(MOCK_ADMIN);
  });

  it('get authentication token - [post] /auth/signin', async () => {
    const res = await axios.post(
      'http://localhost:3000/auth/signin',
      {
        email: MOCK_ADMIN.email,
        password: MOCK_ADMIN.password,
      },
    );

    authToken = res.data.token;
  });

  it('upload attachment - [post] /customer/attachment', async () => {
    const res = await axios.post(
      `${BASE_URL}/attachment`,
      {
        attachment: MOCK_IMAGE_ENCODED,
      },
    );
    expect(res.status).to.eq(200);
  });

  it('add a customer - [post] /customer', async () => {
    const res = await axios.post(
      `${BASE_URL}`,
      MOCK_CUSTOMER,
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');

    expect(data.id).to.eq(MOCK_CUSTOMER.id);
    expect(data.type).to.eq(MOCK_CUSTOMER.type);
    expect(data.company).to.eq(MOCK_CUSTOMER.company);
    expect(data.tax_exemption).to.eq(MOCK_CUSTOMER.tax_exemption);
    expect(data.wholesale_discount).to.eq(MOCK_CUSTOMER.wholesale_discount);
    expect(data.shipping_zone).to.eq(MOCK_CUSTOMER.shipping_zone);
    expect(data.referredby).to.eq(MOCK_CUSTOMER.referredby);
    expect(data.deleted).to.eq(false);

    expect(data.billing).to.be.a('object');
    expect(data.billing.first_name).to.eq(MOCK_CUSTOMER.billing.first_name);
    expect(data.billing.last_name).to.eq(MOCK_CUSTOMER.billing.last_name);
    expect(data.billing.company).to.eq(MOCK_CUSTOMER.billing.company);
    expect(data.billing.address_1).to.eq(MOCK_CUSTOMER.billing.address_1);
    expect(data.billing.address_2).to.eq(MOCK_CUSTOMER.billing.address_2);
    expect(data.billing.city).to.eq(MOCK_CUSTOMER.billing.city);
    expect(data.billing.postal_code).to.eq(MOCK_CUSTOMER.billing.postal_code);
    expect(data.billing.country).to.eq(MOCK_CUSTOMER.billing.country);
    expect(data.billing.state).to.eq(MOCK_CUSTOMER.billing.state);
    expect(data.billing.preferred_method).to.eq(MOCK_CUSTOMER.billing.preferred_method);
    expect(data.billing.phone).to.eq(MOCK_CUSTOMER.billing.phone);

    expect(data.user).to.be.a('object');
    expect(data.user.first_name).to.eq(MOCK_CUSTOMER.user.first_name);
    expect(data.user.last_name).to.eq(MOCK_CUSTOMER.user.last_name);
    expect(data.user.username).to.eq(MOCK_CUSTOMER.user.username);
    expect(data.user.email).to.eq(MOCK_CUSTOMER.user.email);
    expect(data.user.roles).to.include.members(MOCK_CUSTOMER.user.roles);
    expect(data.user).to.not.have.property('password');
    expect(data.user).to.not.have.property('passwordHash');

    customerId = data._id; /* eslint no-underscore-dangle: 0 */
  });

  it('get the list of customers based on the type (eg. wholesale) - [get] /customer?type=wholesale&page=0&count=5&sort=-type',
    async () => {
      const res = await axios.get(
        `${BASE_URL}?type=wholesale&page=0&count=5&sort=-type`,
        {
          headers: {
            Authorization: `bearer ${authToken}`,
          },
        },
      );
      const { data } = res;

      expect(res.status).to.eq(200);
      expect(data).to.be.a('object');

      expect(data).to.have.property('total');
      expect(data).to.have.property('page');
      expect(data).to.have.property('count');
      expect(data).to.have.property('customers');
      expect(data.customers).to.be.a('array');
    });

  it('get a specific customer by id - [get] /customer/:id', async () => {
    const res = await axios.get(
      `${BASE_URL}/${customerId}`,
      {
        headers: {
          Authorization: `bearer ${authToken}`,
        },
      },
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');

    expect(data.id).to.eq(MOCK_CUSTOMER.id);
    expect(data.type).to.eq(MOCK_CUSTOMER.type);
    expect(data.company).to.eq(MOCK_CUSTOMER.company);
    expect(data.tax_exemption).to.eq(MOCK_CUSTOMER.tax_exemption);
    expect(data.wholesale_discount).to.eq(MOCK_CUSTOMER.wholesale_discount);
    expect(data.shipping_zone).to.eq(MOCK_CUSTOMER.shipping_zone);
    expect(data.referredby).to.eq(MOCK_CUSTOMER.referredby);
    expect(data.deleted).to.eq(false);

    expect(data.billing).to.be.a('object');
    expect(data.billing.first_name).to.eq(MOCK_CUSTOMER.billing.first_name);
    expect(data.billing.last_name).to.eq(MOCK_CUSTOMER.billing.last_name);
    expect(data.billing.company).to.eq(MOCK_CUSTOMER.billing.company);
    expect(data.billing.address_1).to.eq(MOCK_CUSTOMER.billing.address_1);
    expect(data.billing.address_2).to.eq(MOCK_CUSTOMER.billing.address_2);
    expect(data.billing.city).to.eq(MOCK_CUSTOMER.billing.city);
    expect(data.billing.postal_code).to.eq(MOCK_CUSTOMER.billing.postal_code);
    expect(data.billing.country).to.eq(MOCK_CUSTOMER.billing.country);
    expect(data.billing.state).to.eq(MOCK_CUSTOMER.billing.state);
    expect(data.billing.phone).to.eq(MOCK_CUSTOMER.billing.phone);

    expect(data.user).to.be.a('object');
    expect(data.user.first_name).to.eq(MOCK_CUSTOMER.user.first_name);
    expect(data.user.last_name).to.eq(MOCK_CUSTOMER.user.last_name);
    expect(data.user.username).to.eq(MOCK_CUSTOMER.user.username);
    expect(data.user.email).to.eq(MOCK_CUSTOMER.user.email);
    expect(data.user.roles).to.include.members(MOCK_CUSTOMER.user.roles);
  });

  it('update a customer - [put] /customer/:id', async () => {
    const res = await axios.put(
      `${BASE_URL}/${customerId}`,
      UPDATED_MOCK_CUSTOMER,
      {
        headers: {
          Authorization: `bearer ${authToken}`,
        },
      },
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');

    expect(data.company).to.eq(UPDATED_MOCK_CUSTOMER.company);
    expect(data.referredby).to.eq(UPDATED_MOCK_CUSTOMER.referredby);

    expect(data.user.first_name).to.eq(UPDATED_MOCK_CUSTOMER.user.first_name);
    expect(data.user.last_name).to.eq(UPDATED_MOCK_CUSTOMER.user.last_name);
    expect(data.user.username).to.eq(UPDATED_MOCK_CUSTOMER.user.username);
    expect(data.user.email).to.eq(UPDATED_MOCK_CUSTOMER.user.email);
    expect(data.user.status).to.eq(UPDATED_MOCK_CUSTOMER.user.status);
  });

  it('soft delete customer - [delete] /customer/:id', async () => {
    const res = await axios.delete(
      `${BASE_URL}/${customerId}`,
      {
        headers: {
          Authorization: `bearer ${authToken}`,
        },
      },
    );

    expect(res.status).to.eq(200);
  });
});
