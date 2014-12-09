// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
