// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupCagGroupModel(app, mongoose)
{
  var cagGroupSchema = mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true
    },
    color: {
      type: String,
      default: '#FFFFFF'
    },
    cags: [String]
  }, {
    id: false
  });

  cagGroupSchema.statics.TOPIC_PREFIX = 'cagGroups';
  cagGroupSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('CagGroup', cagGroupSchema);
};
