// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupWorkCenterModel(app, mongoose)
{
  var workCenterSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      trim: true
    },
    mrpController: {
      type: String,
      ref: 'MrpController',
      default: null
    },
    prodFlow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProdFlow',
      default: null
    },
    description: {
      type: String,
      trim: true
    }
  }, {
    id: false
  });

  workCenterSchema.statics.TOPIC_PREFIX = 'workCenters';
  workCenterSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('WorkCenter', workCenterSchema);
};
