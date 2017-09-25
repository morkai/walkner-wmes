// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupPlanChangeModel(app, mongoose)
{
  const planChangeSchema = new mongoose.Schema({
    plan: Date,
    date: Date,
    user: {},
    data: {}
  }, {
    id: false,
    minimize: false,
    retainKeyOrder: true,
    versionKey: false
  });

  planChangeSchema.statics.TOPIC_PREFIX = 'planning.changes';

  planChangeSchema.index({plan: 1});

  mongoose.model('PlanChange', planChangeSchema);
};
