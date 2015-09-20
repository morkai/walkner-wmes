// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupOpinionSurveyEmployerModel(app, mongoose)
{
  var opinionSurveyEmployerSchema = mongoose.Schema({
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

  opinionSurveyEmployerSchema.statics.TOPIC_PREFIX = 'opinionSurveys.employers';
  opinionSurveyEmployerSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('OpinionSurveyEmployer', opinionSurveyEmployerSchema);
};
