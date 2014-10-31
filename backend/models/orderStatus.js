// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupOrderStatusModel(app, mongoose)
{
  var orderStatusSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      trim: true
    },
    label: {
      type: String,
      trim: true
    },
    color: {
      type: String,
      trim: true,
      default: '#999999'
    }
  }, {
    id: false
  });

  orderStatusSchema.statics.TOPIC_PREFIX = 'orderStatuses';
  orderStatusSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('OrderStatus', orderStatusSchema);
};
