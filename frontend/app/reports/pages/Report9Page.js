// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/data/localStorage',
  '../Report9',
  '../views/9/TableView',
  '../views/9/ChartView',
  '../views/9/PlanUploadView',
  'app/reports/templates/9/page',
  'app/reports/templates/9/actions'
], function(
  t,
  user,
  viewport,
  View,
  bindLoadingMessage,
  localStorage,
  Report,
  TableView,
  ChartView,
  PlanUploadView,
  pageTemplate,
  actionsTemplate
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'report9',

    template: pageTemplate,

    breadcrumbs: [t.bound('reports', '9:breadcrumbs:base')],

    remoteTopics: {
      'cags.plan.synced': function()
      {
        viewport.msg.show({
          type: 'info',
          time: 2500,
          text: t('reports', '9:planUpload:synced')
        });
      },
      'cags.plan.syncFailed': function()
      {
        viewport.msg.show({
          type: 'error',
          time: 5000,
          text: t('reports', '9:planUpload:syncFailed')
        });
      }
    },

    actions: function()
    {
      var page = this;

      return [
        {
          label: t.bound('reports', '9:actions:clearOptions'),
          icon: 'eraser',
          callback: function()
          {
            localStorage.setItem('PLU_QUERY', '');

            page.report.clearOptions();
            page.updateQuery();
          }
        },
        {
          label: t.bound('reports', '9:actions:export'),
          icon: 'download',
          callback: function()
          {
            var btnEl = this.querySelector('.btn');

            btnEl.disabled = true;

            var req = page.ajax({
              type: 'POST',
              url: '/reports;download?filename=' + t('reports', '9:filename:export'),
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
        },
        {
          privileges: 'REPORTS:MANAGE',
          template: actionsTemplate,
          afterRender: function($pageAction)
          {
            $pageAction.find('a').last().on('click', function()
            {
              document.body.focus();

              viewport.showDialog(new PlanUploadView(), t('reports', '9:planUpload:title'));

              return false;
            });
          }
        }
      ];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
      this.defineBindings();

      this.setView('#' + this.idPrefix + '-table', this.tableView);
      this.setView('#' + this.idPrefix + '-chart', this.chartView);

      this.once('afterRender', function()
      {
        this.promised(this.report.fetch());
      });
    },

    defineModels: function()
    {
      this.report = bindLoadingMessage(Report.fromQuery(this.resolveQuery()), this);
    },

    defineViews: function()
    {
      this.tableView = new TableView({model: this.report});
      this.chartView = new ChartView({model: this.report});
    },

    defineBindings: function()
    {
      this.listenTo(this.report, 'change:option', this.updateQuery);
    },

    load: function(when)
    {
      return when();
    },

    resolveQuery: function()
    {
      var queryString = '';
      var query = {};

      if (this.options.queryString)
      {
        try
        {
          queryString = atob(this.options.queryString);
        }
        catch (err) {} // eslint-disable-line no-empty
      }

      if (!queryString)
      {
        queryString = localStorage.getItem('PLU_QUERY') || '';
      }

      if (!queryString)
      {
        return query;
      }

      queryString.split('&').forEach(function(part)
      {
        var eqIndex = part.indexOf('=');

        if (eqIndex !== -1)
        {
          var k = part.substring(0, eqIndex);
          var v = part.substring(eqIndex + 1);

          query[k] = v;
        }
      });

      return query;
    },

    updateQuery: function()
    {
      var query = this.report.serializeQuery();

      this.broker.publish('router.navigate', {
        url: this.report.url() + '?' + btoa(query),
        trigger: false,
        replace: true
      });

      localStorage.setItem('PLU_QUERY', query);
    }

  });
});
