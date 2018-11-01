// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupOrderEtoModel(app, mongoose)
{
  const orderEtoSchema = new mongoose.Schema({
    _id: String,
    updatedAt: Date,
    constructor: String,
    html: String
  }, {
    id: false
  });

  orderEtoSchema.statics.TOPIC_PREFIX = 'orderDocuments.eto';
  orderEtoSchema.statics.BROWSE_LIMIT = 100;

  orderEtoSchema.statics.findSet = function(done)
  {
    this.aggregate([{$group: {_id: null, nc12: {$addToSet: '$_id'}}}], (err, res) =>
    {
      if (err)
      {
        return done(err);
      }

      const set = new Set();

      res[0].nc12.forEach(nc12 => set.add(nc12));

      done(null, set);
    });
  };

  mongoose.model('OrderEto', orderEtoSchema);
};
