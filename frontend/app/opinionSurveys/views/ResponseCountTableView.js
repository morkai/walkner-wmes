// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/i18n',
  'app/core/View',
  '../dictionaries',
  'app/opinionSurveys/templates/responseCountTable'
], function(
  _,
  t,
  View,
  dictionaries,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    beforeRender: function()
    {
      this.stopListening(this.model.report, 'change:responseCountTotal', this.render);
    },

    afterRender: function()
    {
      this.listenToOnce(this.model.report, 'change:responseCountTotal', this.render);
    },

    serialize: function()
    {
      var columns = {};
      var rows = [];
      var report = this.model.report;
      var responseCountTotal = report.get('responseCountTotal');

      _.forEach(report.get('usedDivisions'), function(nouse, divisionId)
      {
        var byEmployer = responseCountTotal[divisionId];

        if (!byEmployer)
        {
          return;
        }

        columns[divisionId] = {};

        _.forEach(byEmployer, function(count, employerId)
        {
          columns[divisionId][employerId] = dictionaries.divisions.get(divisionId).get('short')
            + ' \\ ' + dictionaries.employers.get(employerId).get('short');
        });
      });

      var surveys = this.model.surveys;

      _.forEach(this.model.report.get('responseCountBySurvey'), function(byDivision, surveyId)
      {
        var survey = surveys.get(surveyId);

        if (!survey)
        {
          return;
        }

        var cacheMap = survey.cacheMaps.employeeCount;
        var row = {
          survey: survey.getLabel()
        };

        _.forEach(byDivision, function(byEmployer, divisionId)
        {
          var divisionCacheMap = cacheMap[divisionId] || {};

          row[divisionId] = {};

          _.forEach(byEmployer, function(responseCount, employerId)
          {
            var employeeCount = divisionCacheMap[employerId] || 0;

            row[divisionId][employerId] = {
              responseCount: responseCount,
              employeeCount: employeeCount,
              percent: employeeCount !== 0 ? Math.round(responseCount / employeeCount * 100) : 0
            };
          });
        });

        rows.push(row);
      });

      return {
        idPrefix: this.idPrefix,
        columns: columns,
        rows: rows
      };
    }

  });
});
