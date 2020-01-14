// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/time',
  'app/i18n',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  '../settings',
  '../Report6',
  '../Report6Query',
  '../Report6ProdTasks',
  '../views/6/FilterView',
  '../views/6/EffAndFteChartView',
  '../views/6/CategoryChartView',
  '../views/6/TotalAndAbsenceChartView',
  'app/reports/templates/6/page',
  'app/reports/templates/6/exportPageAction'
], function(
  $,
  time,
  t,
  View,
  bindLoadingMessage,
  settings,
  Report,
  Query,
  ProdTasks,
  FilterView,
  EffAndFteChartView,
  CategoryChartView,
  TotalAndAbsenceChartView,
  pageTemplate,
  exportPageActionTemplate
) {
  'use strict';

  var KIND_TO_CHART_VIEW = {
    totalAndAbsence: TotalAndAbsenceChartView,
    effAndFte: EffAndFteChartView,
    category: CategoryChartView
  };

  return View.extend({

    layoutName: 'page',

    pageId: 'report6',

    template: pageTemplate,

    breadcrumbs: function()
    {
      var breadcrumbs = [];
      var parent = this.query.get('parent');

      if (parent)
      {
        var title;

        if (t.has('reports', 'BREADCRUMB:6:' + parent))
        {
          title = t.bound('reports', 'BREADCRUMB:6:' + parent);
        }
        else
        {
          var prodTask = this.prodTasks.get(parent);

          title = prodTask ? prodTask.getLabel() : '?';
        }

        breadcrumbs.push(
          {
            label: t.bound('reports', 'BREADCRUMB:6'),
            href: this.getReportUrl(null).replace('/', '#')
          },
          title
        );
      }
      else
      {
        breadcrumbs.push(t.bound('reports', 'BREADCRUMB:6'));
      }

      return breadcrumbs;
    },

    actions: function()
    {
      var page = this;

      return [{
        template: exportPageActionTemplate.bind(null, {
          urls: this.getExportUrls()
        }),
        afterRender: function($exportAction)
        {
          page.$exportAction = $exportAction;
        },
        privileges: 'REPORTS:VIEW'
      }, {
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

        var $column = $clickable.closest('.reports-6-column');
        var parent = $column.attr('data-parent');

        if (this.query.get('parent') === parent)
        {
          parent = $column.attr('data-child') || null;
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
    prodTasks: null,
    report: null,
    filterView: null,
    $exportAction: null,

    initialize: function()
    {
      this.defineModels();
      this.defineViews();

      this.setView('.filter-container', this.filterView);
    },

    setUpLayout: function(layout)
    {
      this.layout = layout;
    },

    destroy: function()
    {
      settings.release();

      this.layout = null;
      this.filterView = null;
      this.$exportAction = null;
    },

    defineModels: function()
    {
      this.settings = bindLoadingMessage(settings.acquire(), this);
      this.query = Query.fromQuery(this.options.query);
      this.prodTasks = bindLoadingMessage(new ProdTasks(null, {settings: this.settings, paginate: false}), this);
      this.report = bindLoadingMessage(new Report(null, {query: this.query}), this);

      this.listenTo(this.query, 'change', this.onQueryChange);
      this.listenTo(this.query, 'change:parent', this.onParentChange);

      this.once('afterRender', function()
      {
        this.report.fetch().always(this.updateBreadcrumbs.bind(this));
      });
    },

    defineViews: function()
    {
      this.filterView = new FilterView({model: this.query});
      this.chartViews = [];
    },

    createChartView: function(options)
    {
      return new KIND_TO_CHART_VIEW[options.kind]({
        type: options.type,
        unit: options.unit,
        model: this.report,
        settings: this.settings,
        prodTasks: this.prodTasks
      });
    },

    load: function(when)
    {
      return when(this.settings.fetchIfEmpty(function()
      {
        return this.prodTasks.fetch({reset: true});
      }, this));
    },

    beforeRender: function()
    {
      this.chartViews.forEach(function(chartView)
      {
        chartView.remove();
      });

      this.chartViews = [];
    },

    afterRender: function()
    {
      settings.acquire();

      this.chartsConfiguration = this.prodTasks.createChartsConfiguration();

      this.renderChartsColumns();
      this.renderChartsViews();
      this.changeParent(false);
    },

    renderChartsColumns: function()
    {
      var $container = this.$id('container');

      this.chartsConfiguration.forEach(function(chartRows)
      {
        var $column = $('<div class="reports-6-column"></div>');
        var firstChartRow = chartRows[0];

        if (firstChartRow.parent)
        {
          $column.attr('data-parent', firstChartRow.parent);
        }

        if (firstChartRow.child)
        {
          $column.attr('data-child', firstChartRow.child);
        }

        chartRows.forEach(function(chartRow)
        {
          var $chartRow = $('<div></div>')
            .addClass('reports-6-' + chartRow.kind + '-container')
            .addClass('reports-6-' + chartRow.kind + '-' + chartRow.type);

          if (chartRow.parent)
          {
            $chartRow.addClass('is-clickable');
          }

          $column.append($chartRow);
        });

        $container.append($column);
      });
    },

    renderChartsViews: function()
    {
      if (!this.chartsConfiguration)
      {
        return;
      }

      var page = this;

      this.chartsConfiguration.forEach(function(chartRows)
      {
        chartRows.forEach(function(options)
        {
          var chartView = page.createChartView(options);

          page.chartViews.push(chartView);

          page.setView('.reports-6-' + options.kind + '-' + options.type, chartView);
        });
      });

      this.chartViews.forEach(function(chartView)
      {
        if (!chartView.isRendered())
        {
          chartView.render();
        }
      });
    },

    getExportUrls: function()
    {
      var fromTime = time.getMoment(this.query.get('from')).hours(6).valueOf();
      var toTime = time.getMoment(this.query.get('to')).hours(6).valueOf();
      var subdivisions = [this.settings.getValue('wh.comp.id'), this.settings.getValue('wh.finGoods.id')];
      var format = window.XLSX_EXPORT ? 'xlsx' : 'csv';

      return {
        to: '/warehouse/transferOrders;export.' + format
          + '?sort(shiftDate)&shiftDate>=' + fromTime + '&shiftDate<' + toTime,
        fte: '/fte/wh;export.' + format
          + '?sort(date)&date>=' + fromTime
          + '&date<' + toTime
          + '&subdivision=in=(' + subdivisions + ')'
      };
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

      this.updateExportUrls();
    },

    onParentChange: function()
    {
      this.changeParent(true);
    },

    updateBreadcrumbs: function()
    {
      if (this.layout)
      {
        this.layout.setBreadcrumbs(this.breadcrumbs, this);
      }
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
        $columnsToShow = $columns.filter('[data-parent="' + newParent + '"], [data-child="' + newParent + '"]');

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

      this.updateBreadcrumbs();
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
    },

    updateExportUrls: function()
    {
      if (!this.$exportAction)
      {
        return;
      }

      var urls = this.getExportUrls();

      this.$exportAction.find('a[data-export="to"]').attr('href', urls.to);
      this.$exportAction.find('a[data-export="fte"]').attr('href', urls.fte);
    }

  });
});
