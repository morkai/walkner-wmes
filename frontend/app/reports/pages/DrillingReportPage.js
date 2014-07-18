// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'jquery',
  'app/i18n',
  'app/data/orgUnits',
  'app/core/View',
  '../ReportSettingCollection',
  'app/reports/templates/drillingReportPage'
], function(
  $,
  t,
  orgUnits,
  View,
  ReportSettingCollection,
  drillingReportPageTemplate
) {
  'use strict';

  var CHART_WIDTH = 375;

  return View.extend({

    rootBreadcrumbKey: null,

    settings: null,
    displayOptions: null,
    query: null,
    reports: null,
    chartsViews: null,
    $charts: null,

    layoutName: 'page',

    template: drillingReportPageTemplate,

    title: function()
    {
      var title = [t.bound('reports', this.rootBreadcrumbKey)];
      var orgUnit = orgUnits.getByTypeAndId(this.query.get('orgUnitType'), this.query.get('orgUnitId'));

      if (orgUnit)
      {
        var subtitle = this.query.get('orgUnitType') === 'subdivision' ? (orgUnit.get('division') + ' \\ ') : '';

        title.push(subtitle + orgUnit.getLabel());
      }
      else
      {
        title.push(t.bound('reports', 'BREADCRUMBS:divisions'));
      }

      return title;
    },

    actions: function()
    {
      return [{
        label: t.bound('reports', 'PAGE_ACTION:settings'),
        icon: 'cogs',
        privileges: 'REPORTS:MANAGE',
        href: '#reports;settings'
      }];
    },

    setUpLayout: function(pageLayout)
    {
      this.listenTo(this.query, 'change:orgUnitId', function()
      {
        pageLayout.setTitle(this.title, this);
      });
    },

    events: {
      'mousedown .reports-drillingChart .highcharts-title': function disableMiddleClick(e)
      {
        if (e.button === 1)
        {
          return false;
        }
      },
      'mouseup .reports-drillingChart .highcharts-title': function openReportInNewWindow(e)
      {
        if (e.button === 1 || (e.ctrlKey && e.button === 0))
        {
          var orgUnit = this.getOrgUnitFromChartsElement(this.$(e.target).closest('.reports-drillingCharts'));

          if (orgUnit)
          {
            window.open(this.getReportUrl(orgUnit.type, orgUnit.id).replace(/^\//, '#'));
          }

          return false;
        }
      },
      'click .reports-drillingChart .highcharts-title': function changeOrgUnit(e)
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
      'dblclick .highcharts-container': function toggleFullscreen(e)
      {
        var $target = this.$(e.target);

        if ($target.hasClass('highcharts-title'))
        {
          return;
        }

        var $chartView = $target.closest('.reports-chart');
        var $chartsView = $chartView.closest('.reports-drillingCharts');
        var chartsView = this.getView({el: $chartsView[0]});
        var chartView = chartsView.getView({el: $chartView[0]});

        this.toggleFullscreen(chartView);
      }
    },

    initialize: function()
    {
      this.onKeyDown = this.onKeyDown.bind(this);

      this.defineModels();
      this.defineViews();
      this.defineBindings();

      this.setView('.reports-drillingHeader-container', this.headerView);
      this.setView('.filter-container', this.filterView);
      this.setView('.reports-displayOptions-container', this.displayOptionsView);
      this.insertChartsViews();
    },

    defineModels: function()
    {
      this.settings = new ReportSettingCollection(null, {pubsub: this.pubsub});
      this.displayOptions = this.createDisplayOptions();
      this.query = this.createQuery();
      this.reports = this.createReports(null, null);
    },

    createQuery: function()
    {
      throw new Error();
    },

    createDisplayOptions: function()
    {
      throw new Error();
    },

    createReports: function(parentReport, childReport)
    {
      var requests = 0;

      function onRequestStarted()
      {
        ++requests;
      }

      function onRequestCompleted()
      {
        /*jshint validthis:true*/

        --requests;

        if (requests === 0)
        {
          this.updateExtremes();
        }
      }

      var reports = this.query.createReports(parentReport, childReport, {
        query: this.query,
        settings: this.settings
      });

      reports.forEach(function bindReportRequest(report)
      {
        this.stopListening(report, 'request');
        this.stopListening(report, 'error');
        this.stopListening(report, 'sync');
        this.listenTo(report, 'request', onRequestStarted);
        this.listenTo(report, 'error', onRequestCompleted);
        this.listenTo(report, 'sync', onRequestCompleted);
      }, this);

      return reports;
    },

    defineViews: function()
    {
      this.headerView = this.createHeaderView();
      this.filterView = this.createFilterView();
      this.displayOptionsView = this.createDisplayOptionsView();
      this.chartsViews = this.reports.map(function(report){ return this.createChartsView(report, false); }, this);
    },

    createHeaderView: function()
    {
      throw new Error();
    },

    createFilterView: function()
    {
      throw new Error();
    },

    createDisplayOptionsView: function()
    {
      throw new Error();
    },

    createChartsView: function(report, skipRenderCharts)
    {
      /*jshint unused:false*/

      throw new Error();
    },

    defineBindings: function()
    {
      $('body').on('keydown', this.onKeyDown);

      this.listenTo(this.query, 'change', this.onQueryChange);
      this.listenTo(this.displayOptions, 'change', this.onDisplayOptionsChange);
      this.listenTo(this.filterView, 'showDisplayOptions', this.onShowDisplayOptions);
      this.listenTo(this.displayOptionsView, 'showFilter', this.onShowFilter);
    },

    destroy: function()
    {
      $('body').off('keydown', this.onKeyDown);

      this.$charts = null;

      this.cancelAnimations();
    },

    load: function(when)
    {
      return when(this.settings.fetch({reset: true}));
    },

    afterRender: function()
    {
      this.$charts = this.$id('charts');
    },

    onKeyDown: function(e)
    {
      if (e.ctrlKey && e.keyCode === 32)
      {
        this.toggleDisplayOptionsFilterViews();

        return false;
      }

      if (['INPUT', 'BUTTON', 'SELECT'].indexOf(e.target.tagName) !== -1)
      {
        return;
      }

      if (e.keyCode === 27 && this.isFullscreen())
      {
        this.$('.reports-chart.is-fullscreen .highcharts-container').dblclick();

        return false;
      }

      if (e.keyCode === 39)
      {
        this.scroll(true);

        return false;
      }

      if (e.keyCode === 37)
      {
        this.scroll(false);

        return false;
      }
    },

    onQueryChange: function(query, options)
    {
      var changes = query.changedAttributes();
      var orgUnitChanged = typeof changes.orgUnitId !== 'undefined';
      var refreshAfterDrillLength = typeof changes.orgUnitType === 'undefined' ? 1 : 2;

      if (!options.reset)
      {
        this.broker.publish('router.navigate', {
          url: this.getReportUrl(),
          replace: !orgUnitChanged,
          trigger: false
        });
      }

      if (orgUnitChanged)
      {
        this.drill(Object.keys(changes).length > refreshAfterDrillLength);
      }
      else
      {
        this.refresh();
      }
    },

    onDisplayOptionsChange: function(displayOptions, changes)
    {
      if (changes.series !== undefined || changes.extremes !== undefined)
      {
        this.updateExtremes();
      }

      this.broker.publish('router.navigate', {
        url: this.getReportUrl(),
        replace: true,
        trigger: false
      });
    },

    onShowDisplayOptions: function()
    {
      this.showDisplayOptionsView();
    },

    onShowFilter: function()
    {
      this.showFilterView();
    },

    showDisplayOptionsView: function()
    {
      this.$id('filter').addClass('hidden');
      this.$id('displayOptions').removeClass('hidden');

      if (typeof this.displayOptionsView.shown === 'function')
      {
        this.displayOptionsView.shown();
      }
    },

    showFilterView: function()
    {
      this.$id('displayOptions').addClass('hidden');
      this.$id('filter').removeClass('hidden');

      if (typeof this.filterView.shown === 'function')
      {
        this.filterView.shown();
      }
    },

    toggleDisplayOptionsFilterViews: function()
    {
      if (this.$id('options').hasClass('hidden'))
      {
        this.showDisplayOptionsView();
      }
      else
      {
        this.showFilterView();
      }
    },

    changeOrgUnit: function($charts)
    {
      if (this.$el.hasClass('is-changing'))
      {
        return;
      }

      var orgUnit = this.getOrgUnitFromChartsElement($charts);

      if (orgUnit)
      {
        this.query.set({
          orgUnitType: orgUnit.type,
          orgUnitId: orgUnit.id
        });
      }
    },

    getOrgUnitFromChartsElement: function($charts)
    {
      var orgUnitType = $charts.attr('data-orgUnitType');

      if (!orgUnitType || orgUnitType === 'prodLine')
      {
        return null;
      }

      var orgUnitId = $charts.attr('data-orgUnitId');

      if (!$charts.prev().length)
      {
        var childOrgUnit = orgUnits.getByTypeAndId(orgUnitType, orgUnitId);
        var parentOrgUnit = orgUnits.getParent(childOrgUnit);

        orgUnitType = parentOrgUnit ? orgUnits.getType(parentOrgUnit) : null;
        orgUnitId = parentOrgUnit ? parentOrgUnit.id : null;
      }

      return {
        type: orgUnitType,
        id: orgUnitId
      };
    },

    getReportUrl: function(orgUnitType, orgUnitId)
    {
      return this.reports[0].url()
        + '?' + this.query.serializeToString(orgUnitType, orgUnitId)
        + '#' + this.displayOptions.serializeToString();
    },

    getCurrentReport: function(previous)
    {
      var orgUnit = orgUnits.getByTypeAndId(
        this.query[previous ? 'previous' : 'get']('orgUnitType'),
        this.query[previous ? 'previous' : 'get']('orgUnitId')
      );
      
      for (var i = 0, l = this.reports.length; i < l; ++i)
      {
        var report = this.reports[i];
        
        if (report.get('orgUnit') === orgUnit)
        {
          return report;
        }
      }
      
      return null;
    },

    getChartsViewByReport: function(report)
    {
      for (var i = 0, l = this.chartsViews.length; i < l; ++i)
      {
        var chartsView = this.chartsViews[i];

        if (chartsView.model === report)
        {
          return chartsView;
        }
      }

      return null;
    },

    isFullscreen: function()
    {
      return this.$charts.hasClass('is-fullscreen');
    },

    toggleFullscreen: function(chartView)
    {
      var $charts = this.$charts;
      var chartsContainerEl = $charts[0];

      $charts.toggleClass('is-fullscreen');

      var isFullscreen = this.isFullscreen();
      var height = '';

      if (isFullscreen)
      {
        height = window.innerHeight - $charts.position().top - 10 + 'px';

        $charts.data('scrollLeft', chartsContainerEl.scrollLeft);
        $charts.data('scrollTop', chartsContainerEl.ownerDocument.body.scrollTop);

        chartsContainerEl.scrollLeft = 0;
      }

      $charts.css('min-height', height);
      chartView.$el.toggleClass('is-fullscreen').css('height', height);

      if (typeof chartView.onFullscreen === 'function')
      {
        chartView.onFullscreen(isFullscreen);
      }

      chartView.chart.reflow();

      if (!isFullscreen)
      {
        chartsContainerEl.scrollLeft = $charts.data('scrollLeft');
        chartsContainerEl.ownerDocument.body.scrollTop = $charts.data('scrollTop');
      }
    },

    cleanFullscreen: function()
    {
      this.$charts.removeClass('is-fullscreen');

      var $fullscreenChart = this.$('.reports-chart.is-fullscreen');

      if ($fullscreenChart.length)
      {
        $fullscreenChart.find('.highcharts-container').dblclick();
      }
    },

    updateExtremes: function()
    {
      this.reports.forEach(function(report, i)
      {
        report.set('isParent', i === 0);
      });

      this.displayOptions.updateExtremes(this.reports);
    },

    scroll: function(right)
    {
      var focusedIndex = Math.round(this.$charts[0].scrollLeft / (CHART_WIDTH + 1)) + (right ? 1 : -1);
      var $children = this.$charts.children();
      var scrollLeft = 0;

      for (var i = 0; i < focusedIndex; ++i)
      {
        scrollLeft += $children.eq(i).outerWidth();
      }

      this.$charts.finish().animate({scrollLeft: scrollLeft}, 250);
    },

    insertChartsViews: function(chartsViewToSkip, doInsertAt)
    {
      this.chartsViews.forEach(function(chartsView, i)
      {
        if (chartsView !== chartsViewToSkip)
        {
          this.insertView('.reports-drillingCharts-container', chartsView, doInsertAt ? {insertAt: i} : null);
        }
      }, this);
    },

    refresh: function()
    {
      this.reports.forEach(function(report) { this.promised(report.fetch()); }, this);
    },

    drill: function(refresh)
    {
      if (this.isFullscreen())
      {
        this.cleanFullscreen();
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
      var siblingChartsViews =
        this.chartsViews.filter(function(chartsView) { return chartsView !== parentChartsView; });
      var childChartsViews = [];

      this.reports = this.createReports(parentReport, null);
      this.chartsViews = this.reports.map(function(report, i)
      {
        if (i === 0)
        {
          return parentChartsView;
        }

        var childChartsView = this.createChartsView(report, true);

        childChartsViews.push(childChartsView);

        return childChartsView;
      }, this);

      if (refresh)
      {
        this.promised(parentReport.fetch());
      }

      this.moveChartsViews('drillingDown', siblingChartsViews, childChartsViews, parentChartsView);
    },

    drillUp: function(refresh)
    {
      var workingReport = this.getCurrentReport(true);
      var workingChartsView = this.getChartsViewByReport(workingReport);
      var oldChartsViews = this.chartsViews.filter(function(chartsView) { return chartsView !== workingChartsView; });
      var newChartsViews = [];

      this.reports = this.createReports(null, workingReport);
      this.chartsViews = this.reports.map(function(report)
      {
        if (report === workingReport)
        {
          return workingChartsView;
        }

        var siblingChartsView = this.createChartsView(report, true);

        newChartsViews.push(siblingChartsView);

        return siblingChartsView;
      }, this);

      if (refresh)
      {
        this.promised(workingReport.fetch());
      }

      this.moveChartsViews('drillingUp', oldChartsViews, newChartsViews, workingChartsView);
    },

    replace: function()
    {
      var chartsViewEls = this.chartsViews.map(function(chartsView) { return chartsView.el; });

      $(chartsViewEls).fadeOut(300).promise().done(function()
      {
        this.chartsViews.forEach(function(chartsView) { chartsView.remove(); });

        this.$('.reports-drillingCharts').remove();

        this.reports = this.createReports(null, null);
        this.chartsViews = this.reports.map(function(report) { return this.createChartsView(report, true); }, this);

        this.insertChartsViews(null, false);
        this.showChartsViews('replacing', this.chartsViews);
      }.bind(this));
    },

    moveChartsViews: function(operation, oldChartsViews, newChartsViews, workingChartsView)
    {
      var workingIndex = this.chartsViews.indexOf(workingChartsView);

      workingChartsView.$el.siblings().fadeTo(400, 0).promise().done(function()
      {
        this.$charts.css('overflow-x', 'hidden');

        var pos = workingChartsView.$el.position();

        workingChartsView.$el.css({
          position: 'absolute',
          top: pos.top + 'px',
          left: pos.left + 'px'
        });

        oldChartsViews.forEach(function(chartsView) { chartsView.remove(); });
        this.insertChartsViews(workingChartsView, operation === 'drillingUp');

        workingChartsView.$el.animate({left: workingIndex * CHART_WIDTH}, 300).promise().done(function()
        {
          workingChartsView.$el.css('position', '');
          this.$charts.css('overflow-x', '');
          this.showChartsViews(operation, newChartsViews);
        }.bind(this));
      }.bind(this));
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
    }

  });
});
