// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  '../RearmReport',
  '../views/rearm/FilterView',
  '../views/rearm/LineView',
  'app/reports/templates/rearm/page'
], function(
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
      }, {
        label: this.t('PAGE_ACTION:settings'),
        icon: 'cogs',
        privileges: 'REPORTS:MANAGE',
        href: '#reports;settings?tab=rearm'
      }];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(this.model, this);

      this.setView('#-filter', new FilterView({
        model: this.model
      }));

      this.once('afterRender', () =>
      {
        this.listenTo(this.model, 'filtered', this.onFiltered);
        this.listenTo(this.model.lines, 'reset', () => this.renderLines(true));
      });
    },

    load: function(when)
    {
      if (this.options.autoLoad)
      {
        return when(this.model.fetch());
      }

      return when();
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
      this.removeView('#-lines');

      this.model.lines.forEach(line =>
      {
        var lineView = new LineView({
          model: this.model,
          line: line
        });

        this.insertView('#-lines', lineView);

        if (render)
        {
          lineView.render();
        }
      });
    },

    export: function()
    {
      const page = this;

      viewport.msg.loading();

      const columns = {
        line: {
          type: 'string',
          width: 10,
          caption: caption('line'),
          position: 1
        },
        orderNo: {
          type: 'string',
          width: 10,
          caption: caption('orderNo')
        },
        mrp: {
          type: 'string',
          width: 5,
          caption: caption('mrp')
        },
        shiftAt: {
          type: 'date',
          caption: caption('date')
        },
        shiftNo: {
          type: 'integer',
          width: 7,
          caption: caption('shift')
        },
        startedAt: {
          type: 'time',
          caption: caption('startedAt')
        },
        finishedAt: {
          type: 'time',
          caption: caption('finishedAt')
        },
        firstAt: {
          type: 'time',
          caption: caption('firstAt')
        },
        lastAt: {
          type: 'time',
          caption: caption('lastAt')
        },
        sapTaktTime: {
          type: 'integer',
          width: 8,
          caption: caption('sapTaktTime')
        },
        avgTaktTime: {
          type: 'integer',
          width: 8,
          caption: caption('avgTaktTime')
        },
        medTaktTime: {
          type: 'integer',
          width: 8,
          caption: caption('medTaktTime')
        },
        quantityDone: {
          type: 'integer',
          width: 8,
          caption: caption('quantityDone')
        },
        workerCount: {
          type: 'integer',
          width: 8,
          caption: caption('workerCount')
        },
        efficiency: {
          type: 'integer',
          width: 8,
          caption: caption('efficiency')
        },
        idle: {
          type: 'integer',
          width: 8,
          caption: caption('idle')
        }
      };

      const {settings} = page.model.get('report');

      (settings.downtimeColumns || []).concat(settings.metricColumns || []).forEach(c =>
      {
        columns[c.variable] = {
          type: 'integer',
          width: 8,
          caption: c.variable
        };
      });

      const data = [];

      page.model.lines.forEach(line =>
      {
        line.get('orders').forEach(order =>
        {
          order = {...order};

          (settings.downtimeColumns || []).forEach((c, i) =>
          {
            order[c.variable] = order.downtimes[i];
          });

          (settings.metricColumns || []).forEach((c, i) =>
          {
            order[c.variable] = order.metrics[i];
          });

          delete order.prodShift;
          delete order.prodShiftOrder;
          delete order.downtimes;
          delete order.metrics;

          data.push(order);
        });
      });

      const req = page.ajax({
        type: 'POST',
        url: '/xlsxExporter',
        data: JSON.stringify({
          filename: page.t('rearm:export:fileName'),
          sheetName: page.t('rearm:export:sheetName'),
          freezeRows: 1,
          columns,
          data
        })
      });

      req.fail(() =>
      {
        viewport.msg.loaded();

        viewport.msg.show({
          type: 'error',
          time: 2500,
          text: page.t('core', 'MSG:EXPORTING_FAILURE')
        });
      });

      req.done(id =>
      {
        viewport.msg.loaded();
        pageActions.exportXlsx(`/xlsxExporter/${id}`);
      });

      function caption(column)
      {
        return page.t(`rearm:column:${column}`).replace(/([^\s])-([^\s])/g, '$1$2');
      }
    }

  });
});
