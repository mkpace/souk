import _ from 'lodash';

import { Comment } from '../models/comment.model';

export default class CommentController {
  /**
   * returns the list of all comments
   */
  static async list(req, res) {
    try {
      const comments = await Comment
        .find({ deleted: false })
        .populate('user_id')
        .populate('modified_by')
        .populate('approved_by');

      return res.success(comments);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * get a specific comment
   */
  static async getOne(req, res) {
    if (!req.params.id) {
      return res.error('Invalid id supplied');
    }

    try {
      const comment = await Comment.findOne({
        _id: req.params.id,
        deleted: false,
      });
      if (!comment) {
        return res.error('Item with id not found', 404);
      }

      await Comment.populate(comment, { path: 'user_id' });
      await Comment.populate(comment, { path: 'modified_by' });
      await Comment.populate(comment, { path: 'approved_by' });

      return res.success(comment);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * update a comment
   */
  static async update(req, res) {
    if (!req.params.id) {
      return res.error('Invalid id supplied');
    }

    try {
      const comment = await Comment.findOne({
        _id: req.params.id,
        deleted: false,
      });
      if (!comment) {
        return res.error('Item with id not found');
      }

      delete req.body._id; // eslint-disable-line no-underscore-dangle
      const updated = _.assign(comment, req.body);
      await updated.save();
      await Comment.populate(updated, { path: 'user_id' });
      await Comment.populate(updated, { path: 'modified_by' });
      await Comment.populate(updated, { path: 'approved_by' });

      return res.success(updated);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * soft delete a comment entry
   */
  static async destroy(req, res) {
    if (!req.params.id) {
      return res.error('Invalid id supplied');
    }

    try {
      const comment = await Comment.findOne({
        _id: req.params.id,
        deleted: false,
      });
      if (!comment) {
        return res.error('Item with eamil not found', 404);
      }

      comment.deleted = true;
      await comment.save();

      return res.success('success');
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * get the list of comments by product
   */
  static async listByProduct(req, res) {
    if (!req.params.product_id) {
      return res.error('Invalid product id supplied');
    }

    try {
      const comments = await Comment
        .find({
          product_id: req.params.product_id,
          deleted: false,
        })
        .populate('user_id')
        .populate('modified_by')
        .populate('approved_by');

      return res.success(comments);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * create a new comment entry
   */
  static async create(req, res) {
    if (!req.params.product_id) {
      return res.error('Invalid product id supplied');
    }

    try {
      const comment = await Comment.create(
        _.assign(
          req.body,
          { product_id: req.params.product_id },
        ),
      );
      await Comment.populate(comment, { path: 'user_id' });
      await Comment.populate(comment, { path: 'modified_by' });
      await Comment.populate(comment, { path: 'approved_by' });

      return res.success(comment);
    } catch (err) {
      return res.error(err.message);
    }
  }

  /**
   * approve a comment
   */
  static async approve(req, res) {
    if (!req.params.id) {
      return res.error('Invalid id supplied');
    }

    try {
      const comment = await Comment.findOne({
        _id: req.params.id,
        deleted: false,
      });
      if (!comment) {
        return res.error('Item with id not found');
      }

      comment.status = 'approved';
      await comment.save();
      await Comment.populate(comment, { path: 'user_id' });
      await Comment.populate(comment, { path: 'modified_by' });
      await Comment.populate(comment, { path: 'approved_by' });

      return res.success('success');
    } catch (err) {
      return res.error(err.message);
    }
  }
}
