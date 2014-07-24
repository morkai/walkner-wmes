// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupEmptyOrderModel(app, mongoose)
{
  var emptyOrderSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    createdAt: Date,
    nc12: {
      type: String,
      trim: true
    },
    mrp: {
      type: String,
      trim: true
    },
    startDate: Date,
    finishDate: Date
  }, {
    id: false
  });

  emptyOrderSchema.index({startDate: -1});
  emptyOrderSchema.index({finishDate: -1});

  emptyOrderSchema.statics.TOPIC_PREFIX = 'emptyOrders';
  emptyOrderSchema.statics.BROWSE_LIMIT = 2000;

  emptyOrderSchema.pre('save', function(next)
  {
    /*jshint validthis:true*/

    if (this.isNew)
    {
      this.createdAt = new Date();
    }

    next();
  });

  mongoose.model('EmptyOrder', emptyOrderSchema);
};
