// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupWhEventModel(app, mongoose)
{
  const whEventSchema = new mongoose.Schema({
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
      ref: 'WhOrder'
    },
    data: {}
  }, {
    id: false,
    minimize: false,
    versionKey: false,
    retainKeyOrder: true
  });

  whEventSchema.statics.TOPIC_PREFIX = 'wh.events';
  whEventSchema.statics.BROWSE_LIMIT = 100;

  whEventSchema.index({time: -1});
  whEventSchema.index({type: 1, time: -1});
  whEventSchema.index({order: 1, time: -1});

  whEventSchema.post('save', function(doc)
  {
    app.broker.publish('wh.events.saved', doc.toJSON());
  });

  whEventSchema.statics.record = function(event)
  {
    (new this(event)).save(err =>
    {
      if (err)
      {
        app.error(`[wh] Failed to record event: ${err.message}\n${JSON.stringify(event)}`);
      }
    });
  };

  mongoose.model('WhEvent', whEventSchema);
};
