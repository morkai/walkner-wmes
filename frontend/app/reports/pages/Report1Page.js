// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/viewport',
  'app/core/Collection',
  'app/core/util/pageActions',
  './DrillingReportPage',
  '../Report1Query',
  '../Report1DisplayOptions',
  '../views/1/HeaderView',
  '../views/1/FilterView',
  '../views/1/DisplayOptionsView',
  '../views/1/ChartsView'
], function(
  t,
  viewport,
  Collection,
  pageActions,
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

    rootBreadcrumbKey: 'BREADCRUMB:1',

    pageId: 'report1',

    actions: function(layout)
    {
      var actions = DrillingReportPage.prototype.actions.call(this);

      actions.unshift(pageActions.export({
        layout: layout,
        page: this,
        collection: this.exportCollection,
        privileges: false,
        label: t('reports', 'PAGE_ACTION:1:export'),
        callback: this.onExportClick.bind(this)
      }));

      return actions;
    },

    initialize: function()
    {
      DrillingReportPage.prototype.initialize.apply(this, arguments);

      this.exportCollection = new Collection(null, {
        url: '/reports/1'
      });
      this.exportCollection.rqlQuery = this.query;
      this.exportCollection.length = 1;
    },

    createQuery: function()
    {
      return Query.fromQuery(this.options.query);
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

    onQueryChange: function()
    {
      DrillingReportPage.prototype.onQueryChange.apply(this, arguments);

      this.exportCollection.trigger('sync');
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
        this.timers.autoRefresh = setTimeout(this.refresh.bind(this), 4 * 60 * 1000);
      }
    },

    onExportClick: function()
    {
      if (this.reports[0].isEmpty())
      {
        viewport.msg.show({
          type: 'warning',
          time: 3000,
          text: t('reports', 'MSG:1:export:empty')
        });

        return false;
      }
    }

  });
});
