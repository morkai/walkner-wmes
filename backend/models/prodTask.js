'use strict';

module.exports = function setupProdTaskModel(app, mongoose)
{
  var prodTaskSchema = mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true
    },
    fteMaster: {
      type: Boolean,
      default: true
    },
    fteLeader: {
      type: Boolean,
      default: true
    }
  }, {
    id: false
  });

  prodTaskSchema.statics.TOPIC_PREFIX = 'prodTasks';
  prodTaskSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('ProdTask', prodTaskSchema);
};
