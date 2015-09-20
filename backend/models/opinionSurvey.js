// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');

module.exports = function setupOpinionSurveyModel(app, mongoose)
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

  var opinionSurveySuperiorSchema = mongoose.Schema({
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
    division: {
      type: String,
      required: true
    }
  }, {
    id: false
  });

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

  var opinionSurveyEmployeeCountSchema = mongoose.Schema({
    division: {
      type: String,
      required: true
    },
    employer: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      required: true,
      min: 0
    }
  }, {
    _id: false
  });

  var opinionSurveySchema = mongoose.Schema({
    _id: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    intro: {
      type: String,
      default: ''
    },
    employers: [opinionSurveyEmployerSchema],
    superiors: [opinionSurveySuperiorSchema],
    questions: [opinionSurveyQuestionSchema],
    employeeCount: [opinionSurveyEmployeeCountSchema]
  }, {
    id: false
  });

  opinionSurveySchema.statics.TOPIC_PREFIX = 'opinionSurveys.surveys';

  opinionSurveySchema.pre('save', function(next)
  {
    if (this.isModified('employers') || this.isModified('superiors'))
    {
      this.serializeEmployees();
    }

    next();
  });

  opinionSurveySchema.methods.serializeEmployees = function()
  {
    var oldValues = {};
    var newValues = [];

    _.forEach(this.employeeCount, function(employeeCount)
    {
      oldValues[employeeCount.division + employeeCount.employer] = employeeCount.count;
    });

    var employers = this.employers;

    _.forEach(_.unique(_.pluck(this.superiors, 'division')), function(divisionId)
    {
      _.forEach(employers, function(employer)
      {
        newValues.push({
          division: divisionId,
          employer: employer._id,
          count: oldValues[divisionId + employer._id] || 0
        });
      });
    });

    this.employeeCount = newValues;
  };

  mongoose.model('OpinionSurvey', opinionSurveySchema);
};
