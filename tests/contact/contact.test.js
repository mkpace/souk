import axios from 'axios';
import { expect } from 'chai';

import {
  MOCK_CONTACT,
  UPDATED_MOCK_CONTACT,
} from './mock';

const BASE_URL = 'http://localhost:3000/contact';

/*
 * tests begin
 */
describe('Contact Us API', async () => {
  let contactId;

  it('create a contact entry - [post] /contact', async () => {
    const res = await axios.post(
      `${BASE_URL}`,
      MOCK_CONTACT,
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');

    expect(data.first_name).to.eq(MOCK_CONTACT.first_name);
    expect(data.last_name).to.eq(MOCK_CONTACT.last_name);
    expect(data.email).to.eq(MOCK_CONTACT.email);
    expect(data.phone).to.eq(MOCK_CONTACT.phone);
    expect(data.subject).to.eq(MOCK_CONTACT.subject);
    expect(data.message).to.eq(MOCK_CONTACT.message);
    expect(data.deleted).to.eq(false);

    contactId = data._id; /* eslint no-underscore-dangle: 0 */
  });

  it('get all contact entries - [get] /contact', async () => {
    const res = await axios.get(`${BASE_URL}`);
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('array');
  });

  it('update a contact entry - [put] /contact/:id', async () => {
    const res = await axios.put(
      `${BASE_URL}/${contactId}`,
      UPDATED_MOCK_CONTACT,
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');

    expect(data.phone).to.eq(UPDATED_MOCK_CONTACT.phone);
    expect(data.deleted).to.eq(false);
  });

  it('soft delete a contact entry - [delete] /contact/:id', async () => {
    const res = await axios.delete(`${BASE_URL}/${contactId}`);

    expect(res.status).to.eq(200);
    expect(res.data).to.eq('success');
  });
});
