// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const autoIncrement = require('mongoose-plugin-autoinc-fix');

module.exports = function setupOpinionSurveyActionModel(app, mongoose)
{
  const opinionSurveyActionSchema = new mongoose.Schema({
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
    updatedAt: {
      type: Date,
      default: null
    },
    updater: {},
    division: {
      type: String,
      required: true,
      ref: 'OpinionSurveyDivision'
    },
    owners: [{}],
    superior: {},
    question: {
      type: String,
      required: true
    },
    problem: {
      type: String,
      default: ''
    },
    cause: {
      type: String,
      default: ''
    },
    action: {
      type: String,
      default: ''
    },
    startDate: {
      type: Date,
      default: null
    },
    finishDate: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      default: 'new',
      enum: ['planned', 'progress', 'done', 'failed', 'late']
    },
    participants: [String]
  }, {
    id: false
  });

  opinionSurveyActionSchema.plugin(autoIncrement.plugin, {
    model: 'OpinionSurveyAction',
    field: 'rid',
    startAt: 1,
    incrementBy: 1
  });

  opinionSurveyActionSchema.statics.TOPIC_PREFIX = 'opinionSurveys.actions';

  opinionSurveyActionSchema.pre('save', function(next)
  {
    if (this.isModified('owners') || this.isModified('superior'))
    {
      this.serializeParticipants();
    }

    next();
  });

  opinionSurveyActionSchema.methods.serializeParticipants = function()
  {
    const participants = {};

    if (this.superior)
    {
      participants[this.superior.id] = true;
    }

    _.forEach(this.owners, function(owner)
    {
      participants[owner.id] = true;
    });

    this.participants = Object.keys(participants);
  };

  mongoose.model('OpinionSurveyAction', opinionSurveyActionSchema);
};
