// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/time',
  'app/data/orgUnits',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  '../settings',
  'app/reports/templates/drillingReportPage'
], function(
  $,
  t,
  time,
  orgUnits,
  View,
  bindLoadingMessage,
  settings,
  drillingReportPageTemplate
) {
  'use strict';

  var CHART_WIDTH = 375;
  var CHART_HEIGHT = 248;

  return View.extend({

    rootBreadcrumbKey: null,
    initialSettingsTab: 'quantityDone',
    maxOrgUnitLevel: 'prodLine',

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
        title.push(t.bound('reports', 'BREADCRUMB:divisions'));
      }

      return title;
    },

    actions: function()
    {
      return [{
        label: t.bound('reports', 'PAGE_ACTION:settings'),
        icon: 'cogs',
        privileges: 'REPORTS:MANAGE',
        href: '#reports;settings?tab=' + this.initialSettingsTab
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
      'mouseup .reports-drillingChart .highcharts-title': function(e)
      {
        var orgUnit = this.getOrgUnitFromChartsElement(this.$(e.target).closest('.reports-drillingCharts'));

        if (!orgUnit || this.maxOrgUnitLevel === orgUnit.type)
        {
          return;
        }

        if (e.button === 1 || (e.ctrlKey && e.button === 0))
        {
          if (orgUnit)
          {
            window.open(this.getReportUrl(orgUnit.type, orgUnit.id).replace(/^\//, '#'));
          }

          return false;
        }

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
        if (e.button !== undefined && e.button !== 0 || this.$el.hasClass('is-changing'))
        {
          return;
        }

        var className = e.target.getAttribute('class');

        if (className && className.indexOf('highcharts-title') !== -1)
        {
          return;
        }

        var $chartView = this.$(e.target).closest('.reports-chart');
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

      this.setView('#-header', this.headerView);
      this.setView('#-filter', this.filterView);
      this.setView('#-displayOptions', this.displayOptionsView);
      this.insertChartsViews();
    },

    defineModels: function()
    {
      this.settings = bindLoadingMessage(settings.acquire(), this);
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
      var page = this;
      var requests = 0;

      function onRequestStarted(i)
      {
        ++requests;

        if (requests === 1)
        {
          page.trigger('loading:starting');
        }

        page.trigger('loading:started', i);
      }

      function onRequestCompleted(i)
      {
        --requests;

        page.trigger('loading:completed', i);

        if (requests === 0)
        {
          page.updateExtremes();
          page.toggleDeactivatedOrgUnits(true);
          page.trigger('loading:finishing');
        }
      }

      var reports = page.query.createReports(parentReport, childReport, page.createReportOptions());

      reports.forEach(function bindReportRequest(report, i)
      {
        page.stopListening(report, 'request');
        page.stopListening(report, 'error');
        page.stopListening(report, 'sync');
        page.listenTo(report, 'request', onRequestStarted.bind(page, i));
        page.listenTo(report, 'error', onRequestCompleted.bind(page, i));
        page.listenTo(report, 'sync', onRequestCompleted.bind(page, i));
      });

      return reports;
    },

    defineViews: function()
    {
      this.headerView = this.createHeaderView();
      this.filterView = this.createFilterView();
      this.displayOptionsView = this.createDisplayOptionsView();
      this.chartsViews = this.reports.map(function(report) { return this.createChartsView(report, false); }, this);
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

    createChartsView: function(report, skipRenderCharts) // eslint-disable-line no-unused-vars
    {
      throw new Error();
    },

    createReportOptions: function()
    {
      return {
        query: this.query,
        settings: this.settings
      };
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
      settings.release();

      $('body').off('keydown', this.onKeyDown);

      this.$charts = null;

      this.cancelAnimations();
    },

    load: function(when)
    {
      return when(this.settings.fetchIfEmpty());
    },

    afterRender: function()
    {
      settings.acquire();

      this.$charts = this.$id('charts');

      this.toggleDeactivatedOrgUnits();
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
        this.scrollX(true);

        return false;
      }

      if (e.keyCode === 37)
      {
        this.scrollX(false);

        return false;
      }

      if (e.keyCode === 38)
      {
        return this.scrollY(true);
      }

      if (e.keyCode === 40)
      {
        return this.scrollY(false);
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

      if (options.refreshCharts === false)
      {
        return;
      }

      if (orgUnitChanged)
      {
        this.drill(Object.keys(changes).length > refreshAfterDrillLength);
      }
      else
      {
        this.refresh();

        if (changes.from)
        {
          this.toggleDeactivatedOrgUnits();
        }
      }
    },

    onDisplayOptionsChange: function(displayOptions)
    {
      var changes = displayOptions.changedAttributes();

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
      if (this.$id('displayOptions').hasClass('hidden'))
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
        this.query.set(this.getQueryDataForOrgUnitChange(orgUnit));
      }
    },

    getQueryDataForOrgUnitChange: function(orgUnit)
    {
      return {
        orgUnitType: orgUnit.type,
        orgUnitId: orgUnit.id
      };
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
      var orgUnitId = this.query[previous ? 'previous' : 'get']('orgUnitId');

      for (var i = 0, l = this.reports.length; i < l; ++i)
      {
        var report = this.reports[i];
        var reportOrgUnit = report.get('orgUnit');

        if (reportOrgUnit && reportOrgUnit.id === orgUnitId)
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
      var scrollTop = chartsContainerEl.ownerDocument.scrollingElement.scrollTop;

      $charts.toggleClass('is-fullscreen');

      var isFullscreen = this.isFullscreen();
      var height = '';

      if (isFullscreen)
      {
        height = window.innerHeight - $charts.position().top - 10 + 'px';

        $charts.data('scrollLeft', chartsContainerEl.scrollLeft);
        $charts.data('scrollTop', scrollTop);

        chartsContainerEl.scrollLeft = 0;
      }

      $charts.css('min-height', height);
      chartView.$el.toggleClass('is-fullscreen').css('height', height);

      if (typeof chartView.onFullscreen === 'function')
      {
        chartView.onFullscreen(isFullscreen);
      }

      chartView.chart.destroy();
      chartView.chart = null;
      chartView.afterRender();
      chartView.updateChart();

      if (!isFullscreen)
      {
        chartsContainerEl.scrollLeft = $charts.data('scrollLeft');
        chartsContainerEl.ownerDocument.scrollingElement.scrollTop = $charts.data('scrollTop');
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

    scrollX: function(right)
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

    scrollY: function(up)
    {
      var $body = $(this.el.ownerDocument.body);
      var chartsPosition = this.$charts.position();
      var fixedTopOffset = $body.find('.navbar-fixed-top').outerHeight() || 0;
      var chartsTopPosition = chartsPosition.top - fixedTopOffset;
      var scrollTop = $body.scrollTop();
      var focusedIndex;

      if (scrollTop < chartsTopPosition)
      {
        if (up)
        {
          return;
        }

        focusedIndex = 0;
      }
      else
      {
        focusedIndex = Math.round((scrollTop - chartsTopPosition) / CHART_HEIGHT) + (up ? -1 : 1);
      }

      $body.finish().animate({scrollTop: chartsTopPosition + focusedIndex * CHART_HEIGHT}, 250);

      return false;
    },

    insertChartsViews: function(chartsViewToSkip, doInsertAt)
    {
      this.chartsViews.forEach(function(chartsView, i)
      {
        if (chartsView !== chartsViewToSkip)
        {
          this.insertView('#-charts', chartsView, doInsertAt ? {insertAt: i} : null);
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
        this.trigger('operation:started', 'drillingDown');
        this.drillDown(refresh);
      }
      else if (relationType === orgUnits.RELATION_TYPES.PARENT)
      {
        this.trigger('operation:started', 'drillingUp');
        this.drillUp(refresh);
      }
      else
      {
        this.trigger('operation:started', 'replacing');
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
        if (!this.$charts)
        {
          return;
        }

        this.$charts.addClass('is-moving');

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
          if (!this.$charts)
          {
            return;
          }

          workingChartsView.$el.css('position', '');
          this.$charts.removeClass('is-moving');
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
        if (!page.$charts)
        {
          return;
        }

        $(elsToShow).css('opacity', '');
        page.$el.removeClass('is-changing');
        page.toggleDeactivatedOrgUnits();
        page.trigger('operation:completed', operation);
      });
    },

    toggleDeactivatedOrgUnits: function(hideEmpty)
    {
      var page = this;
      var from = page.query.get('from');

      if (!from)
      {
        var firstShiftMoment = time.getMoment();

        if (firstShiftMoment.hours() < 6)
        {
          firstShiftMoment.subtract(1, 'days');
        }

        from = firstShiftMoment.hours(6).startOf('hour').valueOf();
      }

      page.reports.forEach(function(report, i)
      {
        if (i === 0)
        {
          return;
        }

        var orgUnit = report.get('orgUnit');
        var deactivatedAt = Date.parse(orgUnit.get('deactivatedAt')) || Number.MAX_VALUE;
        var deactivated = from >= deactivatedAt;
        var empty = !!hideEmpty && !!report.isEmpty && report.isEmpty();
        var fadeOut = deactivated || empty;
        var $el = page.chartsViews[i].$el;

        $el[fadeOut ? 'fadeOut' : 'fadeIn']('fast', function()
        {
          $el.css('display', fadeOut ? 'none' : '');
        });
      });
    }

  });
});
