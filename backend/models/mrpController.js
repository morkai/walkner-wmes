// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupMrpControllerModel(app, mongoose)
{
  var mrpControllerSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      trim: true
    },
    subdivision: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subdivision',
      required: true
    },
    description: {
      type: String,
      trim: true
    },
    deactivatedAt: {
      type: Date,
      default: null
    },
    replacedBy: {
      type: String,
      default: null
    },
    inout: {
      type: Number,
      default: 0
    }
  }, {
    id: false
  });

  mrpControllerSchema.statics.TOPIC_PREFIX = 'mrpControllers';
  mrpControllerSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('MrpController', mrpControllerSchema);
};
