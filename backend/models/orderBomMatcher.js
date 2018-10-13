// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupOrderBomMatcherModel(app, mongoose)
{
  const orderBomMatcherSchema = new mongoose.Schema({
    active: {
      type: Boolean,
      default: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    matchers: {
      mrp: [String],
      nc12: [String],
      name: [String]
    },
    components: [{
      pattern: String,
      description: String,
      unique: {
        type: Boolean,
        default: true
      },
      single: {
        type: Boolean,
        default: true
      },
      labelPattern: {
        type: String,
        required: true,
        trim: true
      },
      nc12Index: [Number],
      snIndex: [Number]
    }]
  }, {
    id: false
  });

  orderBomMatcherSchema.statics.TOPIC_PREFIX = 'orderBomMatchers';

  mongoose.model('OrderBomMatcher', orderBomMatcherSchema);
};
