// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');

module.exports = function setupOpinionSurveyModel(app, mongoose)
{
  const opinionSurveyEmployerSchema = new mongoose.Schema({
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

  const opinionSurveySuperiorSchema = new mongoose.Schema({
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

  const opinionSurveyQuestionSchema = new mongoose.Schema({
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

  const opinionSurveyEmployeeCountSchema = new mongoose.Schema({
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

  const opinionSurveySchema = new mongoose.Schema({
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
    const oldValues = {};
    const newValues = [];

    _.forEach(this.employeeCount, function(employeeCount)
    {
      oldValues[employeeCount.division + employeeCount.employer] = employeeCount.count;
    });

    const employers = this.employers;

    _.forEach(_.uniq(_.map(this.superiors, 'division')), function(divisionId)
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
