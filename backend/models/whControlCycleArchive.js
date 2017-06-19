// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupWhControlCycleArchiveModel(app, mongoose)
{
  var whControlCycleArchiveSchema = mongoose.Schema({
    _id: {
      ts: Date,
      nc12: String
    },
    plant: {
      type: String,
      required: true
    },
    wh: {
      type: String,
      required: true
    },
    s: {
      type: Number,
      required: true
    }
  }, {
    id: false,
    versionKey: false
  });

  mongoose.model('WhControlCycleArchive', whControlCycleArchiveSchema);
};
