import axios from 'axios';
import { expect } from 'chai';
import _ from 'lodash';

import { User } from '../../functions/user/models/user.model';
import {
  MOCK_USER,
  MOCK_PRODUCT_ID,
  MOCK_COMMENT,
  UPDATED_MOCK_COMMENT,
} from './mock';

const BASE_URL = 'http://localhost:3000/comment';

/*
 * tests begin
 */
describe('Comment API', async () => {
  let userId;
  let commentId;

  /**
   * create a test user
   */
  before(async () => {
    await User.deleteMany({});

    const user = await User.create(MOCK_USER);
    userId = user._id;
  });

  /**
   * remove test user (soft delete)
   */
  after(async () => {
    await User.findByIdAndUpdate(userId, { deleted: true });
  });

  it('post a new comment - [post] /comment/product/:product_id', async () => {
    const res = await axios.post(
      `${BASE_URL}/product/${MOCK_PRODUCT_ID}`,
      _.assign(
        MOCK_COMMENT,
        {
          user_id: userId,
          modified_by: null,
          approved_by: null,
        },
      ),
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');

    expect(data.comment).to.eq(MOCK_COMMENT.comment);
    expect(data.rating).to.eq(MOCK_COMMENT.rating);
    expect(data.status).to.eq(MOCK_COMMENT.status);
    expect(data.ip).to.eq(MOCK_COMMENT.ip);
    expect(data.deleted).to.eq(false);

    commentId = data._id; /* eslint no-underscore-dangle: 0 */
  });

  it('get all comments - [get] /comment', async () => {
    const res = await axios.get(`${BASE_URL}`);
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('array');
  });

  it('get the list of comments by product - [get] /comment/product/:product_id', async () => {
    const res = await axios.get(`${BASE_URL}/product/${MOCK_PRODUCT_ID}`);
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('array');
  });

  it('update a comment - [put] /comment/:id', async () => {
    const res = await axios.put(
      `${BASE_URL}/${commentId}`,
      UPDATED_MOCK_COMMENT,
    );
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');

    expect(data.status).to.eq(UPDATED_MOCK_COMMENT.status);
    expect(data.rating).to.eq(UPDATED_MOCK_COMMENT.rating);
  });

  it('fetch the specific comment - [get] /comment/:id', async () => {
    const res = await axios.get(`${BASE_URL}/${commentId}`);
    const { data } = res;

    expect(res.status).to.eq(200);
    expect(data).to.be.a('object');

    expect(data.comment).to.eq(MOCK_COMMENT.comment);
    expect(data.status).to.eq(UPDATED_MOCK_COMMENT.status);
    expect(data.ip).to.eq(MOCK_COMMENT.ip);
    expect(data.deleted).to.eq(false);
  });

  it('approve a comment - [put] /comment/:id/approve', async () => {
    const res = await axios.put(
      `${BASE_URL}/${commentId}/approve`,
    );

    expect(res.status).to.eq(200);
  });

  it('soft delete comment - [delete] /comment/:id', async () => {
    const res = await axios.delete(`${BASE_URL}/${commentId}`);

    expect(res.status).to.eq(200);
  });
});
