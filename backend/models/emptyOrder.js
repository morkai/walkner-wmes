// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupEmptyOrderModel(app, mongoose)
{
  var emptyOrderSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
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
