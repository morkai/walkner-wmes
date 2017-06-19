// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupCagPlanModel(app, mongoose)
{
  var cagPlanSchema = mongoose.Schema({
    _id: {
      cag: {
        type: String,
        required: true,
        trim: true
      },
      month: {
        type: Date,
        required: true
      }
    },
    value: {
      type: Number,
      required: true,
      min: 0
    }
  }, {
    id: false
  });

  cagPlanSchema.index({'_id.month': -1});

  mongoose.model('CagPlan', cagPlanSchema);
};
