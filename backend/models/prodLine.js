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
    },
    secretKey: {
      type: String,
      trim: true
    },
    prodShift: {
      type: String,
      ref: 'ProdShift',
      default: null
    },
    prodShiftOrder: {
      type: String,
      ref: 'ProdShiftOrder',
      default: null
    },
    prodDowntime: {
      type: String,
      ref: 'ProdDowntime',
      default: null
    }
  }, {
    id: false,
    toJSON: {
      transform: function(prodLine, ret)
      {
        delete ret.secretKey;

        return ret;
      }
    }
  });

  prodLineSchema.statics.TOPIC_PREFIX = 'prodLines';
  prodLineSchema.statics.BROWSE_LIMIT = 1000;

  prodLineSchema.statics.customizeLeanObject = function(leanModel)
  {
    delete leanModel.secretKey;

    return leanModel;
  };

  mongoose.model('ProdLine', prodLineSchema);
};
