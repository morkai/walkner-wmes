// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupOpinionSurveyQuestionModel(app, mongoose)
{
  var opinionSurveyQuestionSchema = mongoose.Schema({
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

  opinionSurveyQuestionSchema.statics.TOPIC_PREFIX = 'opinionSurveys.questions';
  opinionSurveyQuestionSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('OpinionSurveyQuestion', opinionSurveyQuestionSchema);
};
