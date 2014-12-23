// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  '../ReportSettingCollection',
  '../Report6',
  '../Report6Query',
  '../views/Report6FilterView',
  '../views/Report6EffAndFteChartView',
  '../views/Report6CategoryChartView',
  '../views/Report6TotalAndAbsenceChartView',
  'app/reports/templates/report6Page'
], function(
  t,
  View,
  bindLoadingMessage,
  ReportSettingCollection,
  Report6,
  Report6Query,
  Report6FilterView,
  Report6EffAndFteChartView,
  Report6CategoryChartView,
  Report6TotalAndAbsenceChartView,
  report6PageTemplate
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'report6',

    template: report6PageTemplate,

    breadcrumbs: function()
    {
      var breadcrumbs = [];
      var parent = this.query.get('parent');

      if (parent)
      {
        breadcrumbs.push(
          {
            label: t.bound('reports', 'BREADCRUMBS:6'),
            href: this.getReportUrl(null).replace('/', '#')
          },
          t.bound('reports', 'BREADCRUMBS:6:' + parent)
        );
      }
      else
      {
        breadcrumbs.push(t.bound('reports', 'BREADCRUMBS:6'));
      }

      return breadcrumbs;
    },

    actions: function()
    {
      return [{
        label: t.bound('reports', 'PAGE_ACTION:settings'),
        icon: 'cogs',
        privileges: 'REPORTS:MANAGE',
        href: '#reports;settings?tab=wh'
      }];
    },

    events: {
      'mousedown [data-parent] .highcharts-title': function disableMiddleClick(e)
      {
        if (e.button === 1)
        {
          return false;
        }
      },
      'mouseup [data-parent] .highcharts-title': function(e)
      {
        if (this.$el.hasClass('is-changing') || this.$('.is-fullscreen').length)
        {
          return;
        }

        var $clickable = this.$(e.target).closest('.is-clickable');

        if (!$clickable.length)
        {
          return;
        }

        var parent = $clickable.closest('.reports-6-column').attr('data-parent');

        if (this.query.get('parent') === parent)
        {
          parent = null;
        }

        if (e.button === 1 || (e.ctrlKey && e.button === 0))
        {
          window.open(this.getReportUrl(parent).replace(/^\//, '#'));

          return false;
        }

        if (!e.ctrlKey && e.button === 0)
        {
          this.query.set('parent', parent, {replace: false});
        }
      },
      'dblclick .highcharts-container': function toggleFullscreen(e)
      {
        if (e.button !== undefined && e.button !== 0 || this.$el.hasClass('is-changing'))
        {
          return;
        }

        var className = e.target.getAttribute('class');

        if (className && className.indexOf('highcharts-title') !== -1)
        {
          return;
        }

        this.toggleFullscreen(this.$(e.target).closest('.highcharts-container').parent());
      }
    },

    layout: null,
    settings: null,
    query: null,
    report: null,
    filterView: null,
    effAndFteChartViews: null,
    categoryChartViews: null,
    totalAndAbsenceChartViews: null,

    initialize: function()
    {
      this.defineModels();
      this.defineViews();

      this.setView('.filter-container', this.filterView);

      Object.keys(this.effAndFteChartViews).forEach(function(type)
      {
        this.setView('.reports-6-effAndFte-' + type, this.effAndFteChartViews[type]);
      }, this);

      Object.keys(this.categoryChartViews).forEach(function(type)
      {
        this.setView('.reports-6-category-' + type, this.categoryChartViews[type]);
      }, this);

      Object.keys(this.totalAndAbsenceChartViews).forEach(function(type)
      {
        this.setView('.reports-6-totalAndAbsence-' + type, this.totalAndAbsenceChartViews[type]);
      }, this);
    },

    setUpLayout: function(layout)
    {
      this.layout = layout;
    },

    destroy: function()
    {
      this.layout = null;
      this.filterView = null;
      this.effAndFteChartViews = null;
      this.categoryChartViews = null;
      this.totalAndAbsenceChartViews = null;
    },

    defineModels: function()
    {
      this.settings = bindLoadingMessage(new ReportSettingCollection(null, {pubsub: this.pubsub}), this);
      this.query = Report6Query.fromQuery(this.options.query);
      this.report = bindLoadingMessage(new Report6(null, {query: this.query}), this);

      this.listenTo(this.query, 'change', this.onQueryChange);
      this.listenTo(this.query, 'change:parent', this.onParentChange);
    },

    defineViews: function()
    {
      this.filterView = new Report6FilterView({model: this.query});
      this.effAndFteChartViews = {};
      this.categoryChartViews = {};
      this.totalAndAbsenceChartViews = {};

      [
        'exTransactions',
        'inComp',
        'coopComp',
        'exStorage',
        'fifo',
        'staging',
        'sm',
        'paint',
        'fixBin',
        'finGoodsIn',
        'finGoodsOut'
      ].forEach(this.defineEffAndFteChartView, this);

      [
        'coopComp',
        'exStorage',
        'exTransactions'
      ].forEach(this.defineCategoryChartView.bind(this, 'qty'));

      [
        'fifo',
        'totalAbsence',
        'compAbsence',
        'finGoodsAbsence'
      ].forEach(this.defineCategoryChartView.bind(this, 'fte'));

      [
        'total',
        'comp',
        'finGoods'
      ].forEach(this.defineTotalAndAbsenceChartView, this);
    },

    defineEffAndFteChartView: function(type)
    {
      this.effAndFteChartViews[type] = new Report6EffAndFteChartView({
        type: type,
        model: this.report,
        settings: this.settings
      });
    },

    defineCategoryChartView: function(unit, type)
    {
      this.categoryChartViews[type] = new Report6CategoryChartView({
        type: type,
        unit: unit,
        model: this.report,
        settings: this.settings
      });
    },

    defineTotalAndAbsenceChartView: function(type)
    {
      this.totalAndAbsenceChartViews[type] = new Report6TotalAndAbsenceChartView({
        type: type,
        model: this.report,
        settings: this.settings
      });
    },

    load: function(when)
    {
      return when(this.report.fetch(), this.settings.fetch());
    },

    afterRender: function()
    {
      if (this.query.get('parent'))
      {
        this.changeParent(false);
      }
    },

    getReportUrl: function(parent)
    {
      return this.report.url() + '?' + this.query.serializeToString(parent);
    },

    onQueryChange: function(query, options)
    {
      var changes = query.changedAttributes();
      var parentChanged = changes.parent !== undefined;

      this.broker.publish('router.navigate', {
        url: this.getReportUrl(),
        replace: !parentChanged,
        trigger: false
      });

      if (options && options.reset && !(parentChanged && Object.keys(changes).length === 1))
      {
        this.promised(this.report.fetch());
      }
    },

    onParentChange: function()
    {
      this.changeParent(true);
    },

    changeParent: function(animate)
    {
      if (this.$el.hasClass('is-changing'))
      {
        this.cancelAnimations();
      }

      if (animate)
      {
        this.$el.addClass('is-changing');
      }

      this.$('.is-focused').removeClass('is-focused');

      var newParent = this.query.get('parent');
      var $columns = this.$('.reports-6-column');
      var $columnsToHide;
      var $columnsToShow;
      var page = this;

      if (!newParent)
      {
        $columnsToHide = $columns.filter('[data-child]');
        $columnsToShow = $columns.filter(function()
        {
          return !this.dataset.child;
        });
      }
      else
      {
        $columnsToHide = $columns.filter(function()
        {
          return this.dataset.parent !== newParent && this.dataset.child !== newParent;
        });
        $columnsToShow = $columns.filter('[data-child="' + newParent + '"]');

        this.$('[data-parent="' + newParent + '"]').addClass('is-focused');
      }

      if (animate)
      {
        $columnsToHide.fadeOut().promise().done(function()
        {
          $columnsToShow.fadeIn().promise().done(function()
          {
            page.$el.removeClass('is-changing');
          });
        });
      }
      else
      {
        $columnsToHide.hide();
        $columnsToShow.show();
      }

      if (this.layout)
      {
        this.layout.setBreadcrumbs(this.breadcrumbs, this);
      }
    },

    toggleFullscreen: function($chartContainer)
    {
      var chartView = this.getView({el: $chartContainer[0]});

      if (!chartView || !chartView.chart)
      {
        return;
      }

      var $container = this.$('.reports-6-container');

      if ($chartContainer.hasClass('is-fullscreen'))
      {
        $chartContainer.removeClass('is-fullscreen');
        $container
          .removeClass('is-fullscreen')
          .prop('scrollLeft', $container.data('scrollLeft') || 0);
      }
      else
      {
        $container
          .data('scrollLeft', $container.prop('scrollLeft'))
          .prop('scrollLeft', 0)
          .addClass('is-fullscreen');
        $chartContainer.addClass('is-fullscreen');
      }

      chartView.chart.reflow();
    }

  });
});
