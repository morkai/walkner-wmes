// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupPaintShopEventModel(app, mongoose)
{
  const paintShopEventSchema = new mongoose.Schema({
    type: {
      type: String,
      required: true
    },
    time: {
      type: Date,
      required: true
    },
    user: {
      type: {},
      required: true
    },
    order: {
      type: String,
      default: null,
      ref: 'PaintShopOrder'
    },
    data: {}
  }, {
    id: false,
    minimize: false,
    versionKey: false,
    retainKeyOrder: true
  });

  paintShopEventSchema.statics.TOPIC_PREFIX = 'paintShop.events';
  paintShopEventSchema.statics.BROWSE_LIMIT = 100;

  paintShopEventSchema.index({time: -1});
  paintShopEventSchema.index({type: 1, time: -1});
  paintShopEventSchema.index({order: 1, time: -1});

  paintShopEventSchema.post('save', function(doc)
  {
    app.broker.publish('paintShop.events.saved', doc.toJSON());
  });

  paintShopEventSchema.statics.record = function(event)
  {
    (new this(event)).save(err =>
    {
      if (err)
      {
        app.error(`[paintShop] Failed to record event: ${err.message}\n${JSON.stringify(event)}`);
      }
    });
  };

  mongoose.model('PaintShopEvent', paintShopEventSchema);
};
