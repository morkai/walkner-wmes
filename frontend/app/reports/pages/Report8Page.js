// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/time',
  'app/i18n',
  'app/user',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  '../settings',
  '../Report8',
  '../Report8Query',
  '../views/8/FilterView',
  '../views/8/DirIndirTableView',
  '../views/8/DirIndirChartView',
  '../views/8/TimesTableView',
  '../views/8/TimesChartView',
  'app/reports/templates/8/page'
], function(
  $,
  time,
  t,
  user,
  View,
  bindLoadingMessage,
  settings,
  Report,
  Query,
  FilterView,
  DirIndirTableView,
  DirIndirChartView,
  TimesTableView,
  TimesChartView,
  report8PageTemplate
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'report8',

    template: report8PageTemplate,

    breadcrumbs: [t.bound('reports', 'BREADCRUMB:8')],

    actions: function()
    {
      var page = this;

      return [{
        label: t.bound('reports', 'PAGE_ACTION:8:export'),
        icon: 'download',
        callback: function()
        {
          var btnEl = this.querySelector('.btn');

          btnEl.disabled = true;

          var req = page.ajax({
            type: 'POST',
            url: '/reports;download?filename=' + t('reports', '8:filename:export'),
            contentType: 'text/csv',
            data: page.report.serializeToCsv()
          });

          req.done(function(key)
          {
            window.open('/reports;download?key=' + key);
          });

          req.always(function()
          {
            btnEl.disabled = false;
          });
        }
      }, {
        label: t.bound('reports', 'PAGE_ACTION:settings'),
        icon: 'cogs',
        privileges: 'REPORTS:MANAGE',
        href: '#reports;settings?tab=lean'
      }];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
      this.defineBindings();
      this.setView('.filter-container', this.filterView);
      this.setView('.reports-8-dirIndirTable-container', this.dirIndirTableView);
      this.setView('.reports-8-dirIndirChart-container', this.dirIndirChartView);
      this.setView('.reports-8-timesTable-container', this.timesTableView);
      this.setView('.reports-8-timesChart-container', this.timesChartView);
    },

    destroy: function()
    {
      settings.release();
    },

    defineModels: function()
    {
      this.settings = bindLoadingMessage(settings.acquire(), this);
      this.query = Query.fromRequest(this.options.query, this.options.displayOptions);
      this.report = bindLoadingMessage(new Report(null, {query: this.query}), this);
    },

    defineViews: function()
    {
      this.filterView = new FilterView({
        model: this.query
      });
      this.dirIndirTableView = new DirIndirTableView({
        model: this.report
      });
      this.dirIndirChartView = new DirIndirChartView({
        model: this.report
      });
      this.timesTableView = new TimesTableView({
        model: this.report
      });
      this.timesChartView = new TimesChartView({
        model: this.report
      });
    },

    defineBindings: function()
    {
      this.listenTo(this.query, 'change', this.onQueryChange);
      this.listenTo(this.timesTableView, 'afterRender', this.onTimesTableAfterRender);

      this.once('afterRender', function()
      {
        this.promised(this.report.fetch());
      });
    },

    load: function(when)
    {
      return when(this.settings.fetchIfEmpty());
    },

    afterRender: function()
    {
      settings.acquire();
    },

    onQueryChange: function(query, options)
    {
      if (options && options.reset)
      {
        this.promised(this.report.fetch());
      }

      this.broker.publish('router.navigate', {
        url: this.report.url() + '?' + this.query.serializeToString() + '#' + this.query.serializeSeriesVisibility(),
        replace: true,
        trigger: false
      });
    },

    onTimesTableAfterRender: function()
    {
      this.dirIndirTableView.adjustHeight(this.timesTableView.$el.outerHeight());
    }

  });
});
