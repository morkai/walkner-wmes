// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupIcpoResultModel(app, mongoose)
{
  var icpoResultSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      trim: true
    },
    serviceTag: String,
    orderFilePath: String,
    orderFileHash: String,
    driver: String,
    driverFilePath: String,
    driverFileHash: String,
    gprs: String,
    gprsFilePath: String,
    gprsFileHash: String,
    led: String,
    startedAt: Date,
    finishedAt: Date,
    log: [{}],
    result: String,
    errorCode: String,
    exception: String,
    output: String,
    inputFileHash: String,
    outputFileHash: String,
    srcIp: String,
    srcId: String,
    srcTitle: String,
    srcUuid: String
  }, {
    id: false
  });

  icpoResultSchema.index({serviceTag: 1});
  icpoResultSchema.index({driver: 1, startedAt: -1});
  icpoResultSchema.index({gprs: 1, startedAt: -1});
  icpoResultSchema.index({led: 1, startedAt: -1});
  icpoResultSchema.index({result: 1, startedAt: -1});
  icpoResultSchema.index({startedAt: -1});

  mongoose.model('IcpoResult', icpoResultSchema);
};
