// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
      enum: ['yes', 'no', 'na', 'null']
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
