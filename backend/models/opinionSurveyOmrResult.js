// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupOpinionSurveyOmrResultModel(app, mongoose)
{
  var opinionSurveyOmrResultSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true
    },
    inputDirName: {
      type: String,
      default: ''
    },
    inputFileName: {
      type: String,
      default: ''
    },
    startedAt: {
      type: Date,
      required: true
    },
    finishedAt: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: ['unrecognized', 'recognized', 'ignored', 'fixed']
    },
    errorCode: {
      type: String,
      default: null
    },
    errorMessage: {
      type: String,
      default: null
    },
    response: {
      type: String,
      default: null,
      ref: 'OpinionSurveyResponse'
    },
    qrCode: {
      type: String,
      default: null
    },
    survey: {
      type: String,
      default: null,
      ref: 'OpinionSurvey'
    },
    pageNumber: {
      type: Number,
      default: 0
    },
    scanTemplate: {},
    omrInput: {},
    omrOutput: {},
    matchScore: {
      type: Number,
      default: 0
    },
    answers: {}
  }, {
    id: false,
    minimize: false
  });

  opinionSurveyOmrResultSchema.statics.TOPIC_PREFIX = 'opinionSurveys.omrResults';

  opinionSurveyOmrResultSchema.index({status: 1});
  opinionSurveyOmrResultSchema.index({survey: 1});
  opinionSurveyOmrResultSchema.index({response: 1});

  mongoose.model('OpinionSurveyOmrResult', opinionSurveyOmrResultSchema);
};
