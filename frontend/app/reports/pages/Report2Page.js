// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  './DrillingReportPage',
  '../Report2Query',
  '../Report2DisplayOptions',
  '../views/Report2HeaderView',
  '../views/Report2FilterView',
  '../views/Report2DisplayOptionsView',
  '../views/Report2ChartsView'
], function(
  DrillingReportPage,
  Report2Query,
  Report2DisplayOptions,
  Report2HeaderView,
  Report2FilterView,
  Report2DisplayOptionsView,
  Report2ChartsView
) {
  'use strict';

  return DrillingReportPage.extend({

    rootBreadcrumbKey: 'BREADCRUMBS:2',
    initialSettingsTab: 'clip',

    pageId: 'report2',

    load: function(when)
    {
      return when(this.settings.fetch({reset: true}));
    },

    createQuery: function()
    {
      return new Report2Query(this.options.query);
    },

    createDisplayOptions: function()
    {
      var options = {
        settings: this.settings
      };

      if (typeof this.options.displayOptions === 'string')
      {
        return Report2DisplayOptions.fromString(this.options.displayOptions, options);
      }

      return new Report2DisplayOptions(this.options.displayOptions, options);
    },

    createHeaderView: function()
    {
      return new Report2HeaderView({model: this.query, displayOptions: this.displayOptions});
    },

    createFilterView: function()
    {
      return new Report2FilterView({model: this.query});
    },

    createDisplayOptionsView: function()
    {
      return new Report2DisplayOptionsView({model: this.displayOptions});
    },

    createChartsView: function(report, skipRenderCharts)
    {
      return new Report2ChartsView({
        model: report,
        settings: this.settings,
        displayOptions: this.displayOptions,
        skipRenderCharts: !!skipRenderCharts
      });
    }

  });
});
