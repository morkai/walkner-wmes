// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupCagPlanModel(app, mongoose)
{
  var cagPlanSchema = mongoose.Schema({
    _id: {
      cag: {
        type: String,
        required: true,
        trim: true
      },
      month: {
        type: Date,
        required: true
      }
    },
    value: {
      type: Number,
      required: true,
      min: 0
    }
  }, {
    id: false
  });

  cagPlanSchema.index({'_id.month': -1});

  mongoose.model('CagPlan', cagPlanSchema);
};
