'use strict';

module.exports = function setupProdCenterModel(app, mongoose)
{
  var prodCenterSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    }
  }, {
    id: false
  });

  prodCenterSchema.statics.TOPIC_PREFIX = 'prodCenters';

  mongoose.model('ProdCenter', prodCenterSchema);
};
