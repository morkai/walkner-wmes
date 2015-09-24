// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupOpinionSurveyResponseModel(app, mongoose)
{
  var opinionSurveyAnswerSchema = mongoose.Schema({
    question: {
      type: String,
      required: true,
      ref: 'OpinionSurveyQuestion'
    },
    answer: {
      type: String,
      required: true,
      enum: ['yes', 'no', 'na']
    }
  }, {
    _id: false
  });

  var opinionSurveyResponseSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true
    },
    survey: {
      type: String,
      required: true,
      ref: 'OpinionSurvey'
    },
    scanTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    createdAt: {
      type: Date,
      required: true
    },
    creator: {},
    comment: {
      type: String,
      default: ''
    },
    employer: {
      type: String,
      default: null,
      ref: 'OpinionSurveyEmployer'
    },
    division: {
      type: String,
      default: null,
      ref: 'OpinionSurveyDivision'
    },
    superior: {
      type: String,
      default: null
    },
    answers: [opinionSurveyAnswerSchema]
  }, {
    id: false
  });

  opinionSurveyResponseSchema.statics.TOPIC_PREFIX = 'opinionSurveys.responses';

  opinionSurveyResponseSchema.index({survey: 1});
  opinionSurveyResponseSchema.index({employer: 1});
  opinionSurveyResponseSchema.index({division: 1});
  opinionSurveyResponseSchema.index({superior: 1});

  mongoose.model('OpinionSurveyResponse', opinionSurveyResponseSchema);
};
