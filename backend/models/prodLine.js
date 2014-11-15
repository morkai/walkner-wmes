// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupProdLineModel(app, mongoose)
{
  var prodLineSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
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
    },
    inventoryNo: {
      type: String,
      default: null
    },
    deactivatedAt: {
      type: Date,
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

  prodLineSchema.methods.toDictionaryObject = function()
  {
    return {
      _id: this._id,
      workCenter: this.workCenter,
      description: this.description,
      inventoryNo: this.inventoryNo,
      deactivatedAt: this.deactivatedAt
    };
  };

  mongoose.model('ProdLine', prodLineSchema);
};
