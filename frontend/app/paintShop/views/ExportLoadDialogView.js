// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/core/View',
  'app/core/util/forms/dateTimeRange',
  'app/paintShop/templates/load/export'
], function(
  time,
  View,
  dateTimeRange,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent,
      'change input[type="date"]': function()
      {
        this.$id('submit').prop('disabled', false);
      },
      'submit': function()
      {
        this.$id('submit').prop('disabled', true);

        var from = time.getMoment(this.$id('from-date').val(), 'YYYY-MM-DD').valueOf();
        var to = time.getMoment(this.$id('to-date').val(), 'YYYY-MM-DD').valueOf();

        window.open('/paintShop/load;export.csv?_id=ge=' + from + '&_id=lt=' + to);

        return false;
      }
    },

    afterRender: function()
    {
      var from = time.getMoment(this.model.get('from'));
      var to = time.getMoment(this.model.get('to'));

      if (from.isValid())
      {
        this.$id('from-date').val(from.format('YYYY-MM-DD'));
      }

      if (to.isValid())
      {
        this.$id('to-date').val(to.format('YYYY-MM-DD'));
      }
    }

  });
});
