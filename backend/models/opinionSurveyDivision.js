// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupOpinionSurveyDivisionModel(app, mongoose)
{
  var opinionSurveyDivisionSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true
    },
    full: {
      type: String,
      required: true
    },
    short: {
      type: String,
      required: true
    }
  }, {
    id: false
  });

  opinionSurveyDivisionSchema.statics.TOPIC_PREFIX = 'opinionSurveys.divisions';
  opinionSurveyDivisionSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('OpinionSurveyDivision', opinionSurveyDivisionSchema);
};
