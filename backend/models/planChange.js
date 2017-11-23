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
  planChangeSchema.statics.BROWSE_LIMIT = 1000;

  planChangeSchema.index({plan: 1});

  planChangeSchema.methods.toCreatedMessage = function(plan, isNew)
  {
    const message = this.toJSON();

    message.isNew = isNew;

    (message.data.changedLines || []).forEach(changedLine =>
    {
      const planLine = plan.lines.find(line => line._id === changedLine._id).toObject();

      planLine.orders.forEach(planLineOrder =>
      {
        delete planLineOrder.pceTimes;
      });

      Object.assign(changedLine, planLine);
    });

    return message;
  };

  mongoose.model('PlanChange', planChangeSchema);
};
