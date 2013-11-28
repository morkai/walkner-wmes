'use strict';

module.exports = function setupProdLineModel(app, mongoose)
{
  var prodLineSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    workCenter: {
      type: String,
      ref: 'WorkCenter',
      required: true
    },
    description: {
      type: String,
      trim: true
    }
  }, {
    id: false
  });

  prodLineSchema.statics.TOPIC_PREFIX = 'prodLines';
  prodLineSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('ProdLine', prodLineSchema);
};
