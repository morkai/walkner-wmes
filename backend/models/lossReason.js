// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupLossReasonModel(app, mongoose)
{
  var lossReasonSchema = mongoose.Schema({
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
    position: {
      type: Number,
      default: 0
    }
  }, {
    id: false
  });

  lossReasonSchema.statics.TOPIC_PREFIX = 'lossReasons';
  lossReasonSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('LossReason', lossReasonSchema);
};
