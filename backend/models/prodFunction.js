// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupProdFunctionModel(app, mongoose)
{
  var prodFunctionSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      trim: true
    },
    label: {
      type: String,
      trim: true
    },
    direct: {
      type: Boolean,
      default: false
    },
    dirIndirRatio: {
      type: Number,
      default: 100
    },
    color: {
      type: String,
      default: '#000000'
    }
  }, {
    id: false
  });

  prodFunctionSchema.statics.TOPIC_PREFIX = 'prodFunctions';
  prodFunctionSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('ProdFunction', prodFunctionSchema);
};
