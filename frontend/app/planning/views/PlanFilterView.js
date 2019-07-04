// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/core/View',
  'app/core/util/pageActions',
  'app/data/clipboard',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/planning/templates/planFilter'
], function(
  _,
  $,
  t,
  time,
  viewport,
  View,
  pageActions,
  clipboard,
  setUpMrpSelect2,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'input #-date': 'changeFilter',
      'change #-date': 'changeFilter',
      'change #-mrps': 'changeFilter',
      'click #-lineOrdersList': function()
      {
        this.plan.displayOptions.toggleLineOrdersList();
      },
      'click #-useDarkerTheme': function()
      {
        this.plan.displayOptions.toggleDarkerThemeUse();
      },
      'click a[role="copyOrderList"]': function(e)
      {
        this.copyOrderList(+e.currentTarget.dataset.shift);
      },
      'click #-exportStats': function()
      {
        this.exportStats();
      }

    },

    modelProperty: 'plan',

    initialize: function()
    {
      var plan = this.plan;
      var displayOptions = plan.displayOptions;

      this.listenTo(plan, 'change:loading', this.onLoadingChanged);
      this.listenTo(plan, 'change:_id', this.onDateChanged);
      this.listenTo(displayOptions, 'change:minDate change:maxDate', this.onMinMaxDateChanged);
      this.listenTo(
        displayOptions,
        'change:lineOrdersList change:useDarkerTheme',
        this.updateToggles
      );
    },

    getTemplateData: function()
    {
      var plan = this.plan;
      var displayOptions = plan.displayOptions;

      return {
        date: plan.id,
        mrps: displayOptions.get('mrps'),
        minDate: displayOptions.get('minDate'),
        maxDate: displayOptions.get('maxDate'),
        lineOrdersList: displayOptions.isLineOrdersListEnabled(),
        useDarkerTheme: displayOptions.isDarkerThemeUsed(),
        showToggles: this.options.toggles !== false,
        showStats: this.options.stats !== false
      };
    },

    afterRender: function()
    {
      setUpMrpSelect2(this.$id('mrps'), {
        width: '400px',
        placeholder: this.t('filter:mrps:placeholder'),
        sortable: true,
        own: true,
        view: this
      });
    },

    copyOrderList: function(shiftNo)
    {
      var view = this;
      var mrps = {};

      $('.planning-mrp[data-id]').each(function() { mrps[this.dataset.id] = true; });

      var orderList = view.plan.getOrderList(mrps, shiftNo);

      clipboard.copy(function(clipboardData)
      {
        if (!clipboardData)
        {
          return;
        }

        clipboardData.setData('text/plain', orderList.join('\r\n'));
        clipboardData.setData('text/html', '<ul><li>' + orderList.join('</li><li>') + '</li></ul>');

        var $btn = view.$id('copyOrderList').tooltip({
          container: view.el,
          trigger: 'manual',
          placement: 'bottom',
          title: view.t('toolbar:copyOrderList:success')
        });

        $btn.tooltip('show').data('bs.tooltip').tip().addClass('result success');

        if (view.timers.hideTooltip)
        {
          clearTimeout(view.timers.hideTooltip);
        }

        view.timers.hideTooltip = setTimeout(function() { $btn.tooltip('destroy'); }, 1337);
      });
    },

    getStats: function()
    {
      var stats = {
        manHours: {
          todo: 0,
          late: 0,
          plan: 0,
          remaining: 0
        },
        quantity: {
          todo: 0,
          late: 0,
          plan: 0,
          remaining: 0
        },
        execution: {
          plan: 0,
          done: 0,
          percent: 0,
          1: {
            plan: 0,
            done: 0,
            percent: 0
          },
          2: {
            plan: 0,
            done: 0,
            percent: 0
          },
          3: {
            plan: 0,
            done: 0,
            percent: 0
          }
        },
        orders: {
          todo: 0,
          late: 0,
          plan: 0,
          remaining: 0
        }
      };

      $('.planning-mrp-stats-bd').each(function()
      {
        $(this).find('td').each(function()
        {
          var dataset = this.dataset;

          if (dataset.plan)
          {
            var shiftNo = dataset.shiftNo;

            if (shiftNo)
            {
              stats.execution[shiftNo].plan += parseInt(dataset.plan, 10);
              stats.execution[shiftNo].done += parseInt(dataset.done, 10);
            }
            else
            {
              stats.execution.plan += parseInt(dataset.plan, 10);
              stats.execution.done += parseInt(dataset.done, 10);
            }

            return;
          }

          var value = dataset.value;

          if (value > 0)
          {
            stats[dataset.group][dataset.subgroup] += parseFloat(value);
          }
        });
      });

      stats.execution.percent = stats.execution.plan
        ? Math.round(stats.execution.done / stats.execution.plan * 100)
        : 0;

      for (var shiftNo = 1; shiftNo <= 3; ++shiftNo)
      {
        var execution = stats.execution[shiftNo];

        execution.percent = execution.plan
          ? Math.round(execution.done / execution.plan * 100)
          : 100;
      }

      return stats;
    },

    recountStats: function()
    {
      var stats = this.getStats();

      this.$('td[data-group]').each(function()
      {
        var group = this.dataset.group.split('.');
        var stat = stats[group[0]];

        if (group.length > 1)
        {
          stat = stat[group[1]];
        }

        this.textContent = stat[this.dataset.subgroup].toLocaleString();
      });
    },

    exportStats: function()
    {
      var view = this;

      view.$exportMsg = viewport.msg.show({
        type: 'info',
        text: view.t('MSG:export:started')
      });

      var columns = {
        mrp: {
          type: 'string',
          width: 5,
          headerRotation: 0,
          headerAlignmentH: 'Center',
          headerAlignmentV: 'Center',
          mergeV: 1,
          caption: view.t('stats:mrp')
        }
      };

      addStatColumn('todo');
      addStatColumn('late');
      addStatColumn('plan');
      addStatColumn('remaining');
      addExecutionColumn(1, 3, view.t('filter:stats:execution'));
      addExecutionColumn(2);
      addExecutionColumn(3);
      addExecutionColumn(0);

      var rows = [{
        mrp: '',
        todo$manHours: view.t('stats:manHours'),
        todo$quantity: view.t('stats:quantity'),
        todo$orders: view.t('stats:orderCount'),
        late$manHours: view.t('stats:manHours'),
        late$quantity: view.t('stats:quantity'),
        late$orders: view.t('stats:orderCount'),
        plan$manHours: view.t('stats:manHours'),
        plan$quantity: view.t('stats:quantity'),
        plan$orders: view.t('stats:orderCount'),
        remaining$manHours: view.t('stats:manHours'),
        remaining$quantity: view.t('stats:quantity'),
        remaining$orders: view.t('stats:orderCount'),
        execution$1: view.t('core', 'SHIFT:1'),
        execution$2: view.t('core', 'SHIFT:2'),
        execution$3: view.t('core', 'SHIFT:3'),
        execution$0: view.t('core', 'SHIFT:1') + '-' + view.t('core', 'SHIFT:3')
      }];

      view.plan.mrps.forEach(function(mrp)
      {
        exportRow(mrp.id, mrp.getStats());
      });

      exportRow('', this.getStats());

      var data = {
        filename: view.t('stats:export:fileName', {date: view.plan.id}),
        sheetName: view.t('stats:export:sheetName', {date: view.plan.id}),
        freezeRows: 2,
        freezeColumns: 1,
        subHeader: true,
        subHeaderAlignmentH: 'Center',
        columns: columns,
        data: rows
      };

      var req = view.ajax({
        type: 'POST',
        url: '/xlsxExporter',
        data: JSON.stringify(data)
      });

      req.fail(function()
      {
        viewport.msg.hide(view.$exportMsg, true);

        viewport.msg.show({
          type: 'error',
          time: 2500,
          text: view.t('MSG:export:failure')
        });
      });

      req.done(function(id)
      {
        viewport.msg.hide(view.$exportMsg, true);

        pageActions.exportXlsx('/xlsxExporter/' + id);
      });

      function addStatColumn(id)
      {
        columns[id + '$manHours'] = {
          type: 'decimal',
          width: 10,
          headerAlignmentH: 'Center',
          headerAlignmentV: 'Center',
          mergeH: 2,
          caption: view.t('filter:stats:' + id)
        };

        columns[id + '$quantity'] = {
          type: 'integer',
          width: 10,
          headerAlignmentH: 'Center',
          headerAlignmentV: 'Center',
          caption: ''
        };

        columns[id + '$orders'] = {
          type: 'integer',
          width: 10,
          headerAlignmentH: 'Center',
          headerAlignmentV: 'Center',
          caption: ''
        };
      }

      function addExecutionColumn(shift, mergeH, caption)
      {
        columns['execution$' + shift] = {
          type: 'percent',
          width: 7,
          headerAlignmentH: 'Center',
          headerAlignmentV: 'Center',
          mergeH: mergeH || 0,
          caption: caption || ''
        };
      }

      function exportRow(mrp, stats)
      {
        rows.push({
          mrp: mrp,
          todo$manHours: stats.manHours.todo,
          todo$quantity: stats.quantity.todo,
          todo$orders: stats.orders.todo,
          late$manHours: stats.manHours.late,
          late$quantity: stats.quantity.late,
          late$orders: stats.orders.late,
          plan$manHours: stats.manHours.plan,
          plan$quantity: stats.quantity.plan,
          plan$orders: stats.orders.plan,
          remaining$manHours: stats.manHours.remaining,
          remaining$quantity: stats.quantity.remaining,
          remaining$orders: stats.orders.remaining,
          execution$1: stats.execution[1].percent / 100,
          execution$2: stats.execution[2].percent / 100,
          execution$3: stats.execution[3].percent / 100,
          execution$0: stats.execution.percent / 100
        });
      }
    },

    updateToggles: function()
    {
      if (this.options.toggles === false)
      {
        return;
      }

      var displayOptions = this.plan.displayOptions;

      this.$id('lineOrdersList').toggleClass('active', displayOptions.isLineOrdersListEnabled());
      this.$id('useDarkerTheme').toggleClass('active', displayOptions.isDarkerThemeUsed());
    },

    changeFilter: function()
    {
      var dateEl = this.$id('date')[0];
      var date = dateEl.value;
      var newFilter = {
        mrps: this.$id('mrps').val().split(',').filter(function(v) { return v.length > 0; })
      };

      if (dateEl.checkValidity() && /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date))
      {
        newFilter.date = date;
      }

      if (!_.isEqual(newFilter.mrps, this.plan.displayOptions.get('mrps')))
      {
        this.plan.displayOptions.set('mrps', newFilter.mrps);
      }

      if (newFilter.date && newFilter.date !== this.plan.id)
      {
        this.plan.set('_id', newFilter.date);
      }
    },

    onLoadingChanged: function()
    {
      var loading = this.plan.get('loading');

      this.$id('date').prop('disabled', loading);
      this.$id('mrps').select2('enable', !loading);
    },

    onDateChanged: function()
    {
      this.$id('date').val(this.plan.id);
    },

    onMinMaxDateChanged: function()
    {
      this.$id('date')
        .prop('min', this.plan.displayOptions.get('minDate'))
        .prop('max', this.plan.displayOptions.get('maxDate'));
    }

  });
});
