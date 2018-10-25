// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupSubscriptionModel(app, mongoose)
{
  const subscriptionSchema = new mongoose.Schema({
    user: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    target: {
      type: String,
      required: true
    }
  }, {
    id: false,
    versionKey: false
  });

  subscriptionSchema.statics.TOPIC_PREFIX = 'subscriptions';
  subscriptionSchema.statics.BROWSE_LIMIT = 100;

  subscriptionSchema.index({type: 1, target: 1});
  subscriptionSchema.index({user: 1, type: 1, target: 1}, {unique: true});

  mongoose.model('Subscription', subscriptionSchema);
};
