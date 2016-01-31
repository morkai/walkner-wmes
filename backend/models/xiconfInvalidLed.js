// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupXiconfInvalidLedModel(app, mongoose)
{
  var xiconfInvalidLedSchema = mongoose.Schema({
    time: Date,
    orderNo: String,
    serialNo: String,
    requiredNc12: String,
    actualNc12: String
  }, {
    id: false
  });

  xiconfInvalidLedSchema.index({time: -1});
  xiconfInvalidLedSchema.index({orderNo: 1});

  mongoose.model('XiconfInvalidLed', xiconfInvalidLedSchema);
};
