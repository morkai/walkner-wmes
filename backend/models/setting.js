// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupSettingModel(app, mongoose)
{
  var settingSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    value: {},
    updatedAt: Date,
    updater: {}
  }, {
    id: false
  });

  settingSchema.statics.TOPIC_PREFIX = 'settings';
  settingSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('Setting', settingSchema);
};
