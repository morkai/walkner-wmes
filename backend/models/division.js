// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupDivisionModel(app, mongoose)
{
  var divisionSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['prod', 'dist'],
      default: 'prod'
    },
    description: {
      type: String,
      trim: true
    }
  }, {
    id: false
  });

  divisionSchema.statics.TOPIC_PREFIX = 'divisions';
  divisionSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('Division', divisionSchema);
};
