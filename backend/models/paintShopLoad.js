// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');

module.exports = function setupPaintShopLoadModel(app, mongoose)
{
  const paintShopLoadSchema = new mongoose.Schema({
    _id: Date, // Time
    d: Number // Duration
  }, {
    id: false,
    minimize: false,
    versionKey: false,
    retainKeyOrder: true
  });

  paintShopLoadSchema.statics.TOPIC_PREFIX = 'paintShop.load';
  paintShopLoadSchema.statics.BROWSE_LIMIT = 100;

  paintShopLoadSchema.statics.getStats = function(done)
  {
    const PaintShopLoad = this;
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const timeRanges = [
      {id: 'shift', from: app.fte.currentShift.date.getTime()},
      {id: '10m', from: now - 10 * 60 * 1000},
      {id: '1h', from: now - oneHour},
      {id: '8h', from: now - 8 * oneHour},
      {id: '1d', from: now - 24 * oneHour},
      {id: '7d', from: now - 7 * 24 * oneHour},
      {id: '30d', from: now - 30 * 24 * oneHour}
    ];

    step(
      function()
      {
        PaintShopLoad.findOne({}).sort({_id: -1}).limit(1).exec(this.group());

        timeRanges.forEach(timeRange =>
        {
          const pipeline = [
            {$match: {
              _id: {$gte: new Date(timeRange.from)}
            }},
            {$group: {
              _id: null,
              sum: {$sum: 1},
              avg: {$avg: '$d'},
              min: {$min: '$d'},
              max: {$max: '$d'}
            }}
          ];

          PaintShopLoad.aggregate(pipeline, this.group());
        });
      },
      function(err, results)
      {
        if (err)
        {
          return done(err);
        }

        const stats = {
          last: results.shift()
        };

        timeRanges.forEach(timeRange =>
        {
          const stat = results.shift()[0] || {
            sum: 0,
            avg: 0,
            min: 0,
            max: 0
          };

          delete stat._id;

          stat.avg = Math.round(stat.avg);

          stats[timeRange.id] = stat;
        });

        done(null, stats);
      }
    );
  };

  mongoose.model('PaintShopLoad', paintShopLoadSchema);
};