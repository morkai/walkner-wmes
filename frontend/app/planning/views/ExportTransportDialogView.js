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
  'app/planning/templates/exportTransportDialog'
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

    events: {

      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent,

      'change input[name="filter"]': function()
      {
        var filter = this.$('input[name="filter"]:checked').val();

        this.$id('mrps').prev().toggleClass('hidden', filter === 'lines');
        this.$id('lines').prev().toggleClass('hidden', filter === 'mrps');
      },

      'submit': function()
      {
        this.submitForm();

        return false;
      }

    },

    getTemplateData: function()
    {
      return {
        mrps: this.model.displayOptions.get('mrps').join(',')
      };
    },

    afterRender: function()
    {
      var moment = this.model.getMoment();

      this.$id('from-date').val(moment.format('YYYY-MM-DD'));
      this.$id('to-date').val(moment.add(1, 'days').format('YYYY-MM-DD'));

      setUpMrpSelect2(this.$id('mrps'), {
        width: '100%',
        placeholder: this.t('filter:mrps:placeholder'),
        view: this
      });

      this.$id('lines').select2({
        width: '100%',
        placeholder: this.t('filter:lines:placeholder'),
        multiple: true,
        allowClear: true,
        data: orgUnits.getActiveByType('prodLine').map(idAndLabel).sort(function(a, b)
        {
          return a.text.localeCompare(b.text, undefined, {numeric: true, ignorePunctuation: true});
        })
      }).prev().addClass('hidden');
    },

    submitForm: function()
    {
      var view = this;

      view.$msg = viewport.msg.show({
        type: 'info',
        text: view.t('MSG:export:started')
      });

      view.$id('submit')
        .prop('disabled', true)
        .find('.fa-spinner')
        .removeClass('hidden');

      var filter = view.$('input[name="filter"]:checked').val();

      view.ajax({
        url: '/planning/reports/transport',
        data: {
          from: view.$id('from-date').val(),
          to: view.$id('to-date').val(),
          mrps: filter === 'mrps' ? view.$id('mrps').val() : '',
          lines: filter === 'lines' ? view.$id('lines').val() : ''
        },
        error: function()
        {
          viewport.msg.hide(view.$msg, true);

          viewport.msg.show({
            type: 'error',
            time: 2500,
            text: view.t('MSG:export:failure')
          });

          view.$id('submit')
            .prop('disabled', false)
            .find('.fa-spinner')
            .addClass('hidden');
        },
        success: function(res)
        {
          viewport.msg.hide(view.$msg, true);

          view.exportData(res.options, res.data);
        }
      });
    },

    exportData: function(options, data)
    {
      var view = this;
      var columns = {
        date: {
          type: 'date+utc',
          caption: view.t('transport:date'),
          position: 1
        },
        time: {
          type: 'time+utc',
          caption: view.t('transport:time'),
          position: 2
        },
        shiftNo: {
          type: 'integer',
          width: 7,
          caption: view.t('transport:shiftNo')
        },
        line: {
          type: 'string',
          width: 10,
          caption: view.t('transport:line')
        },
        mrp: {
          type: 'string',
          width: 5,
          caption: view.t('transport:mrp')
        },
        orderNo: {
          type: 'string',
          width: 10,
          caption: view.t('transport:orderNo')
        },
        salesOrderNo: {
          type: 'string',
          width: 10,
          caption: view.t('transport:salesOrderNo')
        },
        salesOrderItem: {
          type: 'string',
          width: 5,
          caption: view.t('transport:salesOrderItem')
        },
        quantity: {
          type: 'integer',
          width: 10,
          caption: view.t('transport:quantity')
        }
      };

      data.forEach(function(row)
      {
        row.date = Date.parse(row.startAt);
        row.time = row.date;
        row.startAt = undefined;
      });

      var nlsData = {
        from: time.utc.format(options.fromTime, 'YY.M.D'),
        to: time.utc.format(options.toTime, 'YY.M.D')
      };
      var req = view.ajax({
        type: 'POST',
        url: '/xlsxExporter',
        data: JSON.stringify({
          filename: view.t('transport:export:fileName', nlsData),
          sheetName: view.t('transport:export:sheetName', nlsData),
          freezeRows: 1,
          columns: columns,
          data: data
        })
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
    }

  });
});
