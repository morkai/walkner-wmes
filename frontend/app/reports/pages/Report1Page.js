// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/data/orgUnits',
  'app/core/View',
  '../Report1',
  '../Report1Query',
  '../MetricRefCollection',
  '../views/Report1HeaderView',
  '../views/Report1FilterView',
  '../views/Report1ChartsView',
  'app/reports/templates/report1Page'
], function(
  _,
  $,
  t,
  orgUnits,
  View,
  Report1,
  Report1Query,
  MetricRefCollection,
  Report1HeaderView,
  Report1FilterView,
  Report1ChartsView,
  report1PageTemplate
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'report1',

    template: report1PageTemplate,

    title: function()
    {
      var title = [t.bound('reports', 'BREADCRUMBS:1')];
      var orgUnit = orgUnits.getByTypeAndId(
        this.query.get('orgUnitType'),
        this.query.get('orgUnitId')
      );

      if (orgUnit)
      {
        var subtitle = this.query.get('orgUnitType') === 'subdivision'
          ? (orgUnit.get('division') + ' \\ ')
          : '';

        title.push(subtitle + orgUnit.getLabel());
      }
      else
      {
        title.push(t.bound('reports', 'BREADCRUMBS:divisions'));
      }

      return title;
    },

    actions: [{
      label: t.bound('reports', 'PAGE_ACTION:editMetricRefs'),
      icon: 'crosshairs',
      privileges: 'REPORTS:MANAGE',
      href: '#reports;metricRefs'
    }],

    events: {
      'mousedown .reports-1-coeffs .highcharts-title': function(e)
      {
        if (e.button === 1)
        {
          return false; // Disable scroll cursor
        }
      },
      'mouseup .reports-1-coeffs .highcharts-title': function(e)
      {
        if (e.button === 1)
        {
          // TODO: Open in a new tab
          return false;
        }
      },
      'click .reports-1-coeffs .highcharts-title': function(e)
      {
        if (!e.ctrlKey && e.button === 0)
        {
          var $chartsView = this.$(e.target).closest('.reports-drillingCharts');

          if (!this.isFullscreen())
          {
            this.changeOrgUnit($chartsView);
          }
        }
      },
      'dblclick .highcharts-container': function(e)
      {
        if (e.target.classList.contains('highcharts-title'))
        {
          return;
        }

        var $chartView = this.$(e.target).closest('.reports-chart');
        var $chartsView = $chartView.closest('.reports-drillingCharts');
        var chartsView = this.getView({el: $chartsView[0]});
        var chartView = chartsView.getView({el: $chartView[0]});

        this.$chartsContainer.toggleClass('is-fullscreen');

        chartView.$el.toggleClass('is-fullscreen');

        if (typeof chartView.onFullscreen === 'function')
        {
          chartView.onFullscreen(this.isFullscreen());
        }

        chartView.chart.reflow();
      }
    },

    initialize: function()
    {
      this.onKeyDown = this.onKeyDown.bind(this);

      $(this.el.ownerDocument.body).on('keydown', this.onKeyDown);

      this.$chartsContainer = null;

      this.defineModels();
      this.defineViews();
      this.setView('.reports-drillingHeader-container', this.headerView);
      this.setView('.filter-container', this.filterView);
      this.insertChartsViews();
    },

    destroy: function()
    {
      $(this.el.ownerDocument.body).off('keydown', this.onKeyDown);

      this.$chartsContainer = null;

      this.cancelAnimations();
    },

    setUpLayout: function(pageLayout)
    {
      this.listenTo(this.query, 'change:orgUnitId', function()
      {
        pageLayout.setTitle(this.title, this);
      });
    },

    afterRender: function()
    {
      this.$chartsContainer = this.$('.reports-drillingCharts-container');

      this.scheduleAutoRefresh();
    },

    defineModels: function()
    {
      this.metricRefs = new MetricRefCollection({
        pubsub: this.pubsub
      });

      this.query = new Report1Query(this.options.query);

      this.reports = this.query.createReports();

      this.listenTo(this.query, 'change', this.onQueryChange);
    },

    defineViews: function()
    {
      this.headerView = new Report1HeaderView({model: this.query});

      this.filterView = new Report1FilterView({model: this.query});

      var metricRefs = this.metricRefs;

      this.chartsViews = this.reports.map(function(report)
      {
        return new Report1ChartsView({
          model: report,
          metricRefs: metricRefs
        });
      });
    },

    load: function(when)
    {
      return when(this.metricRefs.fetch({reset: true}));
    },

    isFullscreen: function()
    {
      return this.$chartsContainer.hasClass('is-fullscreen');
    },

    stopFullscreen: function()
    {
      this.$chartsContainer.removeClass('is-fullscreen');

      var $fullscreenChart = this.$('.reports-drillingChart.is-fullscreen');

      if ($fullscreenChart.length)
      {
        $fullscreenChart.find('.highcharts-container').dblclick();
      }
    },

    insertChartsViews: function(skipChartsView, insertAt)
    {
      this.chartsViews.forEach(function(chartsView, i)
      {
        if (chartsView !== skipChartsView)
        {
          this.insertView('.reports-drillingCharts-container', chartsView, insertAt ? {insertAt: i} : null);
        }
      }, this);
    },

    onQueryChange: function(query, options)
    {
      var changes = query.changedAttributes();
      var orgUnitChanged = typeof changes.orgUnitId !== 'undefined';
      var refreshAfterDrill = typeof changes.orgUnitType === 'undefined' ? 1 : 2;

      if (!options.reset)
      {
        this.broker.publish('router.navigate', {
          url: this.reports[0].url() + '?' + this.query.serializeToString(),
          replace: !orgUnitChanged,
          trigger: false
        });
      }

      if (orgUnitChanged)
      {
        this.drill(Object.keys(changes).length > refreshAfterDrill);
      }
      else
      {
        this.refresh();
      }
    },

    changeOrgUnit: function($charts)
    {
      if (this.$el.hasClass('is-changing'))
      {
        return;
      }

      var orgUnitType = $charts.attr('data-orgUnitType');

      if (!orgUnitType || orgUnitType === 'prodLine')
      {
        return;
      }

      var orgUnitId = $charts.attr('data-orgUnitId');

      if (!$charts.prev().length)
      {
        var childOrgUnit = orgUnits.getByTypeAndId(orgUnitType, orgUnitId);
        var parentOrgUnit = orgUnits.getParent(childOrgUnit);

        orgUnitType = parentOrgUnit ? orgUnits.getType(parentOrgUnit) : null;
        orgUnitId = parentOrgUnit ? parentOrgUnit.id : null;
      }

      this.query.set({
        orgUnitType: orgUnitType,
        orgUnitId: orgUnitId
      });
    },

    refresh: function()
    {
      this.reports.forEach(function(report) { this.promised(report.fetch()); }, this);

      this.scheduleAutoRefresh();
    },

    scheduleAutoRefresh: function()
    {
      clearTimeout(this.timers.autoRefresh);

      if (this.query.isAutoMode())
      {
        this.timers.autoRefresh = setTimeout(this.refresh.bind(this), 10 * 60 * 1000);
      }
    },

    drill: function(refresh)
    {
      if (this.isFullscreen())
      {
        this.stopFullscreen();
      }

      var relationType;

      if (this.$el.hasClass('is-changing'))
      {
        relationType = orgUnits.RELATION_TYPES.UNRELATED;

        this.cancelRequests();
        this.cancelAnimations();

        this.chartsViews.forEach(function(chartsView) { chartsView.remove(); });

        this.chartsViews = [];
        this.reports = [];
      }
      else
      {
        relationType = orgUnits.getRelationType(
          this.query.previous('orgUnitType'),
          this.query.previous('orgUnitId'),
          this.query.get('orgUnitType'),
          this.query.get('orgUnitId')
        );

        this.$el.addClass('is-changing');
      }

      if (relationType === orgUnits.RELATION_TYPES.CHILD)
      {
        this.drillDown(refresh);
      }
      else if (relationType === orgUnits.RELATION_TYPES.PARENT)
      {
        this.drillUp(refresh);
      }
      else
      {
        this.replace();
      }
    },

    drillDown: function(refresh)
    {
      var parentReport = this.getCurrentReport();
      var parentChartsView = this.getChartsViewByReport(parentReport);
      var siblingChartsViews = this.chartsViews.filter(
        function(chartsView) { return chartsView !== parentChartsView; }
      );
      var childChartsViews = [];
      var metricRefs = this.metricRefs;

      this.reports = this.query.createReports(parentReport);
      this.chartsViews = this.reports.map(function(report, i)
      {
        if (i === 0)
        {
          return parentChartsView;
        }

        var childChartsView = new Report1ChartsView({
          model: report,
          metricRefs: metricRefs,
          skipRenderCharts: true
        });

        childChartsViews.push(childChartsView);

        return childChartsView;
      });

      if (refresh)
      {
        this.promised(parentReport.fetch());
      }

      this.moveChartsViews(
        'drillingDown',
        siblingChartsViews,
        childChartsViews,
        parentChartsView
      );
    },

    drillUp: function(refresh)
    {
      var workingReport = this.getCurrentReport(true);
      var workingChartsView = this.getChartsViewByReport(workingReport);
      var oldChartsViews =
        this.chartsViews.filter(function(chartsView) { return chartsView !== workingChartsView; });
      var newChartsViews = [];
      var metricRefs = this.metricRefs;

      this.reports = this.query.createReports(null, workingReport);
      this.chartsViews = this.reports.map(function(report)
      {
        if (report === workingReport)
        {
          return workingChartsView;
        }

        var siblingChartsView = new Report1ChartsView({
          model: report,
          metricRefs: metricRefs,
          skipRenderCharts: true
        });

        newChartsViews.push(siblingChartsView);

        return siblingChartsView;
      });

      if (refresh)
      {
        this.promised(workingReport.fetch());
      }

      this.moveChartsViews(
        'drillingUp',
        oldChartsViews,
        newChartsViews,
        workingChartsView
      );
    },

    replace: function()
    {
      var page = this;
      var chartsViewEls = this.chartsViews.map(function(chartsView) { return chartsView.el; });

      $(chartsViewEls).fadeOut(300).promise().done(function()
      {
        page.chartsViews.forEach(function(chartsView) { chartsView.remove(); });

        page.$('.reports-drillingCharts').remove();

        page.reports = page.query.createReports();
        page.chartsViews = page.reports.map(function(report)
        {
          return new Report1ChartsView({
            model: report,
            metricRefs: page.metricRefs,
            skipRenderCharts: true
          });
        });

        page.insertChartsViews();
        page.showChartsViews('replacing', page.chartsViews);
      });
    },

    moveChartsViews: function(operation, oldChartsViews, newChartsViews, workingChartsView)
    {
      var page = this;
      var workingIndex = this.chartsViews.indexOf(workingChartsView);

      workingChartsView.$el.siblings().fadeTo(400, 0).promise().done(function()
      {
        page.$chartsContainer.css('overflow-x', 'hidden');

        var pos = workingChartsView.$el.position();

        workingChartsView.$el.css({
          position: 'absolute',
          top: pos.top + 'px',
          left: pos.left + 'px'
        });

        oldChartsViews.forEach(function(chartsView) { chartsView.remove(); });
        page.insertChartsViews(workingChartsView, operation === 'drillingUp');

        workingChartsView.$el.animate({left: workingIndex * 375}, 300).promise().done(function()
        {
          workingChartsView.$el.css('position', '');
          page.$chartsContainer.css('overflow-x', '');
          page.showChartsViews(operation, newChartsViews);
        });
      });
    },

    showChartsViews: function(operation, chartsViews)
    {
      var page = this;
      var elsToFade = [];
      var elsToShow = [];

      this.$el.addClass('is-' + operation);

      chartsViews.forEach(function(chartsView, i)
      {
        chartsView.render();
        chartsView.$el.css('opacity', 0);

        if (i < 5)
        {
          elsToFade.push(chartsView.el);
        }
        else
        {
          elsToShow.push(chartsView.el);
        }
      });

      this.$el.removeClass('is-' + operation);

      chartsViews.forEach(function(chartsView)
      {
        chartsView.renderCharts(true);
      });

      $(elsToFade).fadeTo(400, 1).promise().done(function()
      {
        $(elsToShow).css('opacity', '');
        page.$el.removeClass('is-changing');
      });
    },

    getCurrentReport: function(previous)
    {
      var orgUnit = orgUnits.getByTypeAndId(
        this.query[previous ? 'previous' : 'get']('orgUnitType'),
        this.query[previous ? 'previous' : 'get']('orgUnitId')
      );

      return _.find(this.reports, function(report) { return report.get('orgUnit') === orgUnit; });
    },

    getChartsViewByReport: function(report)
    {
      return _.find(this.chartsViews, function(chartsView) { return chartsView.model === report; });
    },

    onKeyDown: function(e)
    {
      if (e.target.tagName === 'INPUT' && !e.target.classList.contains('btn'))
      {
        return;
      }

      if (e.keyCode === 39)
      {
        this.scroll(true);

        return false;
      }
      else if (e.keyCode === 37)
      {
        this.scroll(false);

        return false;
      }
    },

    scroll: function(right)
    {
      var focusedIndex = Math.round(this.$chartsContainer[0].scrollLeft / 376) + (right ? 1 : -1);
      var $children = this.$chartsContainer.children();
      var scrollLeft = 0;

      for (var i = 0; i < focusedIndex; ++i)
      {
        scrollLeft += $children.eq(i).outerWidth();
      }

      this.$chartsContainer.finish().animate({scrollLeft: scrollLeft}, 250);
    }

  });
});
