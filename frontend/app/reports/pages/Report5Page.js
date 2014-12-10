// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  './DrillingReportPage',
  '../Report5Query',
  '../Report5DisplayOptions',
  '../views/Report5HeaderView',
  '../views/Report5FilterView',
  '../views/Report5DisplayOptionsView',
  '../views/Report5ChartsView'
], function(
  DrillingReportPage,
  Report5Query,
  Report5DisplayOptions,
  Report5HeaderView,
  Report5FilterView,
  Report5DisplayOptionsView,
  Report5ChartsView
) {
  'use strict';

  return DrillingReportPage.extend({

    rootBreadcrumbKey: 'BREADCRUMBS:5',
    initialSettingsTab: 'hr',
    maxOrgUnitLevel: 'subdivision',

    pageId: 'report5',

    load: function(when)
    {
      return when(this.settings.fetch({reset: true}));
    },

    createQuery: function()
    {
      return new Report5Query(this.options.query);
    },

    createDisplayOptions: function()
    {
      var options = {
        settings: this.settings
      };

      if (typeof this.options.displayOptions === 'string')
      {
        return Report5DisplayOptions.fromString(this.options.displayOptions, options);
      }

      return new Report5DisplayOptions(this.options.displayOptions, options);
    },

    createHeaderView: function()
    {
      return new Report5HeaderView({model: this.query, displayOptions: this.displayOptions});
    },

    createFilterView: function()
    {
      return new Report5FilterView({model: this.query});
    },

    createDisplayOptionsView: function()
    {
      return new Report5DisplayOptionsView({model: this.displayOptions});
    },

    createChartsView: function(report, skipRenderCharts)
    {
      return new Report5ChartsView({
        model: report,
        settings: this.settings,
        displayOptions: this.displayOptions,
        skipRenderCharts: !!skipRenderCharts
      });
    }

  });
});
