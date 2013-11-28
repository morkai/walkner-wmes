'use strict';

module.exports = function setupProdFlowModel(app, mongoose)
{
  var prodFlowSchema = mongoose.Schema({
    mrpController: {
      type: 'String',
      ref: 'MrpController',
      required: true
    },
    name: {
      type: String,
      trim: true,
      required: true
    }
  }, {
    id: false
  });

  prodFlowSchema.statics.TOPIC_PREFIX = 'prodFlows';

  mongoose.model('ProdFlow', prodFlowSchema);
};
