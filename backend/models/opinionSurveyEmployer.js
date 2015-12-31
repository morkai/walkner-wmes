// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
    },
    color: {
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
