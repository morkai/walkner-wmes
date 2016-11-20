// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupProdSerialNumberModel(app, mongoose)
{
  const prodSerialNumberSchema = new mongoose.Schema({
    _id: String,
    scannedAt: {
      type: Date,
      required: true
    },
    prodLine: {
      type: String,
      required: true
    },
    prodShiftOrder: {
      type: String,
      required: true
    },
    orderNo: {
      type: String,
      required: true,
      pattern: /^[0-9]+$/
    },
    serialNo: {
      type: Number,
      required: true,
      min: 1,
      max: 9999
    },
    taktTime: {
      type: Number,
      required: true,
      min: 0
    }
  }, {
    id: false,
    versionKey: false,
    minimize: false
  });

  prodSerialNumberSchema.statics.TOPIC_PREFIX = 'prodSerialNumbers';

  prodSerialNumberSchema.index({orderNo: 1});
  prodSerialNumberSchema.index({prodShiftOrder: 1, scannedAt: -1});

  mongoose.model('ProdSerialNumber', prodSerialNumberSchema);
};
