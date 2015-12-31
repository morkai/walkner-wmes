// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../core/Model',
  './dictionaries'
], function(
  _,
  time,
  Model,
  dictionaries
) {
  'use strict';

  return Model.extend({

    urlRoot: '/opinionSurveys/surveys',

    clientUrlRoot: '#opinionSurveys',

    topicPrefix: 'opinionSurveys.surveys',

    privilegePrefix: 'OPINION_SURVEYS',

    nlsDomain: 'opinionSurveys',

    labelAttribute: 'label',

    serialize: function()
    {
      var obj = this.toJSON();

      obj.startDate = time.format(obj.startDate, 'LL');
      obj.endDate = time.format(obj.endDate, 'LL');
      obj.superiors = this.serializeSuperiors();
      obj.employeeCount = this.serializeEmployeeCount();

      return obj;
    },

    serializeSuperiors: function()
    {
      return (this.get('superiors') || []).map(function(superior)
      {
        var division = dictionaries.divisions.get(superior.division);

        if (division)
        {
          superior.division = division.get('full');
        }

        return superior;
      });
    },

    serializeEmployeeCount: function()
    {
      return (this.get('employeeCount') || []).map(function(employeeCount)
      {
        var division = dictionaries.divisions.get(employeeCount.division);

        if (division)
        {
          employeeCount.division = division.get('full');
        }

        var employer = dictionaries.employers.get(employeeCount.employer);

        if (employer)
        {
          employeeCount.employer = employer.get('short');
        }

        employeeCount.count = employeeCount.count.toLocaleString();

        return employeeCount;
      });
    },

    buildCacheMaps: function()
    {
      if (!this.cacheMaps)
      {
        this.on('change', this.buildCacheMaps);
      }

      var attrs = this.attributes;
      var cacheMaps = {
        employers: {},
        divisions: {},
        superiors: {},
        questions: {},
        employeeCount: {}
      };

      _.forEach(attrs.employers, function(employer) { cacheMaps.employers[employer._id] = employer; }, this);
      _.forEach(attrs.questions, function(question) { cacheMaps.questions[question._id] = question; }, this);
      _.forEach(attrs.superiors, function(superior)
      {
        cacheMaps.superiors[superior._id] = superior;

        if (!cacheMaps.divisions[superior.division])
        {
          cacheMaps.divisions[superior.division] = [];
        }

        cacheMaps.divisions[superior.division].push(superior);
      }, this);
      _.forEach(attrs.employeeCount, function(employeeCount)
      {
        if (!cacheMaps.employeeCount[employeeCount.division])
        {
          cacheMaps.employeeCount[employeeCount.division] = {};
        }

        cacheMaps.employeeCount[employeeCount.division][employeeCount.employer] = employeeCount.count;
      });

      this.cacheMaps = cacheMaps;
    }

  }, {

  });
});
