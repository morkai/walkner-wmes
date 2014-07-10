// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
    fteMasterPosition: {
      type: Number,
      min: -1,
      default: -1
    },
    direct: {
      type: Boolean,
      default: false
    },
    dirIndirRatio: {
      type: Number,
      default: 100
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
