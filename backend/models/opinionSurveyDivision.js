// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupOpinionSurveyDivisionModel(app, mongoose)
{
  const opinionSurveyDivisionSchema = new mongoose.Schema({
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
