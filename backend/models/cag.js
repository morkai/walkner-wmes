// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupCagModel(app, mongoose)
{
  var cagSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      trim: true,
      pattern: /^[0-9]{6}$/
    },
    name: {
      type: String,
      required: true,
      trim: true
    }
  }, {
    id: false
  });

  cagSchema.statics.TOPIC_PREFIX = 'cags';
  cagSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('Cag', cagSchema);
};
