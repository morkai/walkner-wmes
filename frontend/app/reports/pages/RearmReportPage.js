// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  '../RearmReport',
  '../views/rearm/FilterView',
  '../views/rearm/LineView',
  'app/reports/templates/rearm/page'
], function(
  _,
  t,
  viewport,
  View,
  bindLoadingMessage,
  pageActions,
  Report,
  FilterView,
  LineView,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template: template,

    breadcrumbs: function()
    {
      return [
        this.t('rearm:breadcrumb')
      ];
    },

    actions: function()
    {
      return [{
        icon: 'download',
        label: this.t('core', 'PAGE_ACTION:export'),
        callback: this.export.bind(this)
      }];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(this.model, this);

      this.setView('#-filter', new FilterView({
        model: this.model
      }));

      this.listenTo(this.model, 'filtered', this.onFiltered);

      this.listenToOnce(this, 'afterRender', function()
      {
        this.listenTo(this.model.lines, 'reset', function() { this.renderLines(true); });
      });
    },

    load: function(when)
    {
      return when(
        this.model.fetch()
      );
    },

    onFiltered: function()
    {
      this.promised(this.model.fetch());

      this.broker.publish('router.navigate', {
        url: this.model.genClientUrl(),
        trigger: false,
        replace: true
      });
    },

    beforeRender: function()
    {
      this.renderLines(false);
    },

    renderLines: function(render)
    {
      var page = this;

      page.removeView('#-lines');

      page.model.lines.forEach(function(line)
      {
        var lineView = new LineView({
          model: page.model,
          line: line
        });

        page.insertView('#-lines', lineView);

        if (render)
        {
          lineView.render();
        }
      });
    },

    export: function()
    {
      var view = this;

      viewport.msg.loading();

      var columns = {
        line: {
          type: 'string',
          width: 10,
          caption: view.t('rearm:column:line'),
          position: 1
        },
        orderNo: {
          type: 'string',
          width: 10,
          caption: view.t('rearm:column:orderNo')
        },
        mrp: {
          type: 'string',
          width: 5,
          caption: view.t('rearm:column:mrp')
        },
        shiftAt: {
          type: 'date',
          caption: view.t('rearm:column:date')
        },
        shiftNo: {
          type: 'integer',
          width: 7,
          caption: view.t('rearm:column:shift')
        },
        startedAt: {
          type: 'time',
          caption: view.t('rearm:column:startedAt')
        },
        finishedAt: {
          type: 'time',
          caption: view.t('rearm:column:finishedAt')
        },
        firstAt: {
          type: 'time',
          caption: view.t('rearm:column:firstAt')
        },
        lastAt: {
          type: 'time',
          caption: view.t('rearm:column:lastAt')
        },
        idle: {
          type: 'integer',
          width: 8,
          caption: view.t('rearm:column:idle')
        },
        downtime: {
          type: 'integer',
          width: 8,
          caption: view.t('rearm:column:downtime')
        },
        breaks: {
          type: 'integer',
          width: 8,
          caption: view.t('rearm:column:breaks')
        },
        avgTaktTime: {
          type: 'integer',
          width: 8,
          caption: view.t('rearm:column:avgTaktTime')
        },
        metric0: {
          type: 'integer',
          width: 8,
          caption: view.t('rearm:column:metric0')
        },
        metric1: {
          type: 'integer',
          width: 8,
          caption: view.t('rearm:column:metric1')
        },
        metric2: {
          type: 'integer',
          width: 8,
          caption: view.t('rearm:column:metric2')
        },
        metric3: {
          type: 'integer',
          width: 8,
          caption: view.t('rearm:column:metric3')
        }
      };
      var data = [];

      view.model.lines.forEach(function(line)
      {
        data = data.concat(line.get('orders'));
      });

      var req = view.ajax({
        type: 'POST',
        url: '/xlsxExporter',
        data: JSON.stringify({
          filename: view.t('rearm:export:fileName'),
          sheetName: view.t('rearm:export:sheetName'),
          freezeRows: 1,
          columns: columns,
          data: data
        })
      });

      req.fail(function()
      {
        viewport.msg.loaded();

        viewport.msg.show({
          type: 'error',
          time: 2500,
          text: view.t('MESSAGE:EXPORTING_FAILURE')
        });
      });

      req.done(function(id)
      {
        viewport.msg.loaded();
        pageActions.exportXlsx('/xlsxExporter/' + id);
      });
    }

  });
});
