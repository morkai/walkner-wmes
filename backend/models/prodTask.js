'use strict';

module.exports = function setupProdTaskModel(app, mongoose)
{
  var prodTaskSchema = mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true
    },
    aors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Aor'
    }]
  }, {
    id: false
  });

  prodTaskSchema.statics.TOPIC_PREFIX = 'prodTasks';
  prodTaskSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('ProdTask', prodTaskSchema);
};
