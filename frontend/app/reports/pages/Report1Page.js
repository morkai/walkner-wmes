// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  './DrillingReportPage',
  '../Report1Query',
  '../Report1DisplayOptions',
  '../views/1/HeaderView',
  '../views/1/FilterView',
  '../views/1/DisplayOptionsView',
  '../views/1/ChartsView'
], function(
  DrillingReportPage,
  Query,
  DisplayOptions,
  HeaderView,
  FilterView,
  DisplayOptionsView,
  ChartsView
) {
  'use strict';

  return DrillingReportPage.extend({

    rootBreadcrumbKey: 'BREADCRUMBS:1',

    pageId: 'report1',

    createQuery: function()
    {
      return new Query(this.options.query);
    },

    createDisplayOptions: function()
    {
      var options = {settings: this.settings};

      if (typeof this.options.displayOptions === 'string')
      {
        return DisplayOptions.fromString(this.options.displayOptions, options);
      }

      return new DisplayOptions(this.options.displayOptions, options);
    },

    createHeaderView: function()
    {
      return new HeaderView({model: this.query, displayOptions: this.displayOptions});
    },

    createFilterView: function()
    {
      return new FilterView({model: this.query});
    },

    createDisplayOptionsView: function()
    {
      return new DisplayOptionsView({model: this.displayOptions});
    },

    createChartsView: function(report, skipRenderCharts)
    {
      return new ChartsView({
        model: report,
        settings: this.settings,
        displayOptions: this.displayOptions,
        skipRenderCharts: !!skipRenderCharts
      });
    },

    afterRender: function()
    {
      DrillingReportPage.prototype.afterRender.call(this);

      this.scheduleAutoRefresh();
    },

    refresh: function()
    {
      DrillingReportPage.prototype.refresh.call(this);

      this.scheduleAutoRefresh();
    },

    scheduleAutoRefresh: function()
    {
      clearTimeout(this.timers.autoRefresh);

      if (this.query.isAutoMode())
      {
        this.timers.autoRefresh = setTimeout(this.refresh.bind(this), 10 * 60 * 1000);
      }
    }

  });
});
