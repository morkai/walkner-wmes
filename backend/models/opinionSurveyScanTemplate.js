// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupOpinionSurveyScanTemplateModel(app, mongoose)
{
  const scanTemplateRegionSchema = new mongoose.Schema({
    question: {
      type: String,
      required: true
    },
    options: [String],
    top: {
      type: Number,
      required: true
    },
    left: {
      type: Number,
      required: true
    },
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    }
  }, {
    _id: false
  });

  const opinionSurveyScanTemplateSchema = new mongoose.Schema({
    survey: {
      type: String,
      required: true,
      ref: 'OpinionSurvey'
    },
    name: {
      type: String,
      required: true
    },
    pageNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    },
    dp: {
      type: Number,
      default: 1,
      min: 0.1
    },
    minimumDistance: {
      type: Number,
      default: 90,
      min: 1
    },
    cannyThreshold: {
      type: Number,
      default: 200,
      min: 1
    },
    circleAccumulatorThreshold: {
      type: Number,
      default: 25,
      min: 1
    },
    minimumRadius: {
      type: Number,
      default: 25,
      min: 1
    },
    maximumRadius: {
      type: Number,
      default: 40,
      min: 1
    },
    filledThreshold: {
      type: Number,
      default: 235,
      min: 0,
      max: 255
    },
    markedThreshold: {
      type: Number,
      default: 40,
      min: 0,
      max: 100
    },
    image: {
      type: String,
      required: true
    },
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    },
    regions: [scanTemplateRegionSchema]
  }, {
    id: false
  });

  opinionSurveyScanTemplateSchema.statics.TOPIC_PREFIX = 'opinionSurveys.scanTemplates';

  opinionSurveyScanTemplateSchema.index({survey: 1});

  mongoose.model('OpinionSurveyScanTemplate', opinionSurveyScanTemplateSchema);
};
