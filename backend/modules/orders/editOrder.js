// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const deepEqual = require('deep-equal');
const ObjectId = require('mongoose').Types.ObjectId;

module.exports = function editOrder(app, module, orderNo, data, userInfo, done)
{
  const mongoose = app[module.config.mongooseId];
  const Order = mongoose.model('Order');

  if (_.isEmpty(data.comment))
  {
    data.comment = '';
  }

  if (!validateEditInput(data))
  {
    return done(app.createError('INPUT', 400));
  }

  data.comment = data.comment.trim();

  step(
    function findOrderStep()
    {
      const fields = {
        qtyMax: 1,
        delayReason: 1,
        whStatus: 1,
        whTime: 1,
        whDropZone: 1
      };

      Order.findById(orderNo, fields).lean().exec(this.next());
    },
    function editOrderStep(err, order)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!order)
      {
        return this.skip(app.createError('NOT_FOUND', 404));
      }

      const change = {
        time: new Date(),
        user: userInfo,
        oldValues: {},
        newValues: {},
        comment: data.comment,
        source: data.source || 'other'
      };
      const update = {
        $push: {changes: change}
      };

      const valuesToCheck = {
        qtyMax: {
          old: order.qtyMax && order.qtyMax[data.operationNo] || 0,
          new: data.qtyMax,
          value: value => Object.assign({}, order.qtyMax || {}, {[data.operationNo]: value}),
          change: value => ({operationNo: data.operationNo, value})
        },
        delayReason: {
          old: order.delayReason ? order.delayReason.toString() : '',
          new: data.delayReason,
          value: v => v === '' ? null : new ObjectId(v),
          change: v => v === '' ? null : new ObjectId(v)
        },
        whStatus: {
          old: order.whStatus,
          new: data.whStatus,
          value: v => v,
          change: v => v
        },
        whTime: {
          old: order.whTime,
          new: data.whTime ? new Date(data.whTime) : data.whTime,
          value: v => v,
          change: v => v
        },
        whDropZone: {
          old: order.whDropZone,
          new: data.whDropZone,
          value: v => v,
          change: v => v
        }
      };

      Object.keys(valuesToCheck).forEach(k =>
      {
        const values = valuesToCheck[k];

        if (values.new === undefined || deepEqual(values.new, values.old))
        {
          return;
        }

        if (!update.$set)
        {
          update.$set = {};
        }

        update.$set[k] = values.value(values.new);
        change.oldValues[k] = values.change(values.old);
        change.newValues[k] = values.change(values.new);
      });

      if (_.isEmpty(change.newValues) && !change.comment.length)
      {
        return this.skip();
      }

      this.change = change;

      Order.collection.update({_id: order._id}, update, this.next());
    },
    function sendResultsStep(err)
    {
      if (err)
      {
        return done(err);
      }

      if (this.change)
      {
        app.broker.publish(`orders.updated.${orderNo}`, {
          _id: orderNo,
          change: this.change
        });
      }

      done();
    }
  );
};

function validateEditInput(input)
{
  const {comment, delayReason, qtyMax, operationNo, whStatus, whTime, whDropZone} = input;

  if (!_.isString(comment))
  {
    return false;
  }

  if (delayReason !== undefined
    && delayReason !== ''
    && !/^[a-f0-9]{24}$/.test(delayReason))
  {
    return false;
  }

  if (qtyMax !== undefined
    && (qtyMax < 0 || qtyMax > 9999 || !/^[0-9]{4}$/.test(operationNo)))
  {
    return false;
  }

  if (whStatus !== undefined && !_.isString(whStatus))
  {
    return false;
  }

  if (whTime !== undefined && whTime !== null && isNaN(Date.parse(whTime)))
  {
    return false;
  }

  if (whDropZone !== undefined && !_.isString(whDropZone))
  {
    return false;
  }

  return true;
}
