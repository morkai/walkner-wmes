// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/core/View',
  'app/core/util/pageActions',
  'app/core/util/forms/dateTimeRange',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/paintShop/templates/planExecutionExport'
], function(
  time,
  View,
  pageActions,
  dateTimeRange,
  setUpMrpSelect2,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent,

      'submit': function()
      {
        var $submit = this.$id('submit').prop('disabled', true);
        var from = this.$id('from-date').val();
        var to = this.$id('to-date').val();
        var mrp = this.$id('mrp').val();
        var fromMoment = time.getMoment(from, 'YYYY-MM-DD');
        var toMoment = time.getMoment(to, 'YYYY-MM-DD');
        var dayDiff = toMoment.diff(fromMoment, 'days');
        var format = dayDiff > 4 * 31 ? 'csv' : 'xlsx';
        var url = '/paintShop/orders;export-plan-execution.' + format
          + '?from=' + from
          + '&to=' + to
          + '&mrp=' + encodeURIComponent(mrp);

        if (format === 'xlsx')
        {
          pageActions.exportXlsx(url).always(function()
          {
            $submit.prop('disabled', false);
          });
        }
        else
        {
          window.open(url);

          this.timers.enableSubmit = setTimeout(function() { $submit.prop('disabled', false); }, 2000);
        }

        return false;
      }
    },

    afterRender: function()
    {
      View.prototype.afterRender.apply(this, arguments);

      setUpMrpSelect2(this.$id('mrp'), {
        width: '100%',
        view: this,
        own: true
      });
    }

  });
});
