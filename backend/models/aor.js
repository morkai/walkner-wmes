// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupAorModel(app, mongoose)
{
  var aorSchema = mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    color: {
      type: String,
      default: '#f08f44'
    },
    refColor: {
      type: String,
      default: '#ffa85c'
    },
    refValue: {
      type: Number,
      default: 0
    }
  }, {
    id: false
  });

  aorSchema.statics.TOPIC_PREFIX = 'aors';
  aorSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('Aor', aorSchema);
};
