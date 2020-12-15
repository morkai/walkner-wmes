// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/core/View',
  'app/core/util/idAndLabel',
  'app/core/util/pageActions',
  'app/core/util/forms/dateTimeRange',
  'app/data/orgUnits',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/wh/templates/pickup/exportOrdersDialog'
], function(
  _,
  t,
  time,
  viewport,
  View,
  idAndLabel,
  pageActions,
  dateTimeRange,
  orgUnits,
  setUpMrpSelect2,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    modelProperty: 'whOrders',

    events: {

      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent,

      'change input[name="filter"]': 'toggleFilter',

      'submit': function()
      {
        this.submitForm();

        return false;
      }

    },

    getTemplateData: function()
    {
      return {
        mrps: this.plan.displayOptions.get('mrps').join(','),
        lines: this.plan.displayOptions.get('lines').join(',')
      };
    },

    afterRender: function()
    {
      var moment = this.plan.getMoment();

      this.$id('from-date').val(moment.format('YYYY-MM-DD'));
      this.$id('to-date').val(moment.add(1, 'days').format('YYYY-MM-DD'));

      setUpMrpSelect2(this.$id('mrps'), {
        width: '100%',
        placeholder: this.t('exportOrders:mrps:placeholder'),
        view: this
      });

      this.$id('lines').select2({
        width: '100%',
        placeholder: this.t('exportOrders:lines:placeholder'),
        multiple: true,
        allowClear: true,
        data: orgUnits.getActiveByType('prodLine').map(idAndLabel).sort(function(a, b)
        {
          return a.text.localeCompare(b.text, undefined, {numeric: true, ignorePunctuation: true});
        })
      });

      this.toggleFilter();
    },

    toggleFilter: function()
    {
      var filter = this.$('input[name="filter"]:checked').val();

      this.$id('mrps').prev().toggleClass('hidden', filter === 'lines');
      this.$id('lines').prev().toggleClass('hidden', filter === 'mrps');
    },

    submitForm: function()
    {
      var view = this;
      var from = time.utc.getMoment(view.$id('from-date').val(), 'YYYY-MM-DD');
      var to = time.utc.getMoment(view.$id('to-date').val(), 'YYYY-MM-DD');
      var filter = view.$('input[name="filter"]:checked').val();
      var mrps = view.$id('mrps').val();
      var lines = view.$id('lines').val();
      var url = '/old/wh/orders;export.xlsx?date>=' + from.valueOf() + '&date<' + to.valueOf();

      if (filter === 'mrps' && mrps.length)
      {
        url += '&mrp=in=(' + mrps + ')';
      }
      else if (filter === 'lines' && lines.length)
      {
        url += '&lines._id=in=(' + lines + ')';
      }

      if (Math.abs(to.diff(from, 'days')) > 31)
      {
        window.open(url.replace('.xlsx', '.csv'));

        return;
      }

      view.$id('submit').prop('disabled', true);

      pageActions.exportXlsx(url).always(function()
      {
        view.$id('submit').prop('disabled', false);
      });
    },

    exportStats: function(options, stats)
    {
      var view = this;
      var columns = {
        date: {
          type: 'string',
          width: 10,
          headerRotation: 0,
          headerAlignmentH: 'Center',
          headerAlignmentV: 'Center',
          mergeV: 1,
          caption: view.t('stats:date')
        },
        division: {
          type: 'string',
          width: 10,
          headerRotation: 0,
          headerAlignmentH: 'Center',
          headerAlignmentV: 'Center',
          mergeV: 1,
          caption: view.t('stats:division')
        },
        mrp: {
          type: 'string',
          width: 5,
          headerRotation: 0,
          headerAlignmentH: 'Center',
          headerAlignmentV: 'Center',
          mergeV: 1,
          caption: view.t('stats:mrp')
        },
        line: {
          type: 'string',
          width: 10,
          headerRotation: 0,
          headerAlignmentH: 'Center',
          headerAlignmentV: 'Center',
          mergeV: 1,
          caption: view.t('stats:line')
        }
      };

      addStatColumn('todo');
      addStatColumn('late');
      addStatColumn('plan');
      addStatColumn('remaining');
      addStatColumn('executed');
      addExecutionColumn(1, 3, view.t('filter:stats:execution'));
      addExecutionColumn(2);
      addExecutionColumn(3);
      addExecutionColumn(0);

      var rows = [{
        date: '',
        division: '',
        mrp: '',
        line: '',
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
        executed$manHours: view.t('stats:manHours'),
        executed$quantity: view.t('stats:quantity'),
        executed$orders: view.t('stats:orderCount'),
        execution$1: view.t('core', 'SHIFT:1'),
        execution$2: view.t('core', 'SHIFT:2'),
        execution$3: view.t('core', 'SHIFT:3'),
        execution$0: view.t('core', 'SHIFT:1') + '-' + view.t('core', 'SHIFT:3')
      }];

      stats.forEach(function(stats)
      {
        rows.push({
          date: stats.date,
          division: _.isEmpty(stats.division) ? '' : stats.division.join(' '),
          mrp: stats.mrp,
          line: stats.line,
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
          executed$manHours: stats.manHours.executed,
          executed$quantity: stats.quantity.executed,
          executed$orders: stats.orders.executed,
          execution$1: stats.execution[1].percent / 100,
          execution$2: stats.execution[2].percent / 100,
          execution$3: stats.execution[3].percent / 100,
          execution$0: stats.execution[0].percent / 100
        });
      });

      var nlsData = {
        from: time.utc.format(options.fromTime, 'YY.M.D'),
        to: time.utc.format(options.toTime, 'YY.M.D')
      };
      var data = {
        filename: view.t('stats:export:fileName', nlsData),
        sheetName: view.t('stats:export:sheetName', nlsData),
        freezeRows: 2,
        freezeColumns: 3,
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
        viewport.msg.hide(view.$msg, true);

        viewport.msg.show({
          type: 'error',
          time: 2500,
          text: view.t('MSG:export:failure')
        });
      });

      req.done(function(id)
      {
        viewport.msg.hide(view.$msg, true);

        pageActions.exportXlsx('/xlsxExporter/' + id);
      });

      req.always(function()
      {
        view.$id('submit')
          .prop('disabled', false)
          .find('.fa-spinner')
          .addClass('hidden');
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
    }

  });
});
