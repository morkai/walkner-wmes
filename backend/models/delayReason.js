// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupDelayReasonModel(app, mongoose)
{
  var delayReasonSchema = mongoose.Schema({
    name: {
      type: String,
      trim: true
    }
  }, {
    id: false
  });

  delayReasonSchema.statics.TOPIC_PREFIX = 'delayReasons';
  delayReasonSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('DelayReason', delayReasonSchema);
};
