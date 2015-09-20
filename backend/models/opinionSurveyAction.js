// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var autoIncrement = require('mongoose-auto-increment');

module.exports = function setupOpinionSurveyActionModel(app, mongoose)
{
  var opinionSurveyActionSchema = mongoose.Schema({
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
    var participants = {};

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
