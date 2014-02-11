'use strict';

module.exports = function setupProdFunctionModel(app, mongoose)
{
  var prodFunctionSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    label: {
      type: String,
      trim: true
    },
    position: {
      type: Number,
      min: -1,
      default: -1
    },
    direct: {
      type: Boolean,
      default: false
    },
    companies: [{
      type: String,
      ref: 'Company'
    }]
  }, {
    id: false
  });

  prodFunctionSchema.statics.TOPIC_PREFIX = 'prodFunctions';
  prodFunctionSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('ProdFunction', prodFunctionSchema);
};
