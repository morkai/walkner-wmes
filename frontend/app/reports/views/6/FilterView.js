// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'js2form',
  'app/time',
  'app/core/View',
  'app/core/util/buttonGroup',
  'app/core/util/forms/dateTimeRange',
  'app/reports/templates/6/filter',
  'app/reports/util/getFromTimeByInterval'
], function(
  js2form,
  time,
  View,
  buttonGroup,
  dateTimeRange,
  template,
  getFromTimeByInterval
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent,
      'submit': function(e)
      {
        e.preventDefault();

        this.changeFilter();
      }
    },

    afterRender: function()
    {
      var formData = this.serializeFormData();

      js2form(this.el, formData);

      buttonGroup.toggle(this.$id('interval'));
    },

    serializeFormData: function()
    {
      return {
        interval: this.model.get('interval'),
        'from-date': time.format(+this.model.get('from'), 'YYYY-MM-DD'),
        'to-date': time.format(+this.model.get('to'), 'YYYY-MM-DD')
      };
    },

    changeFilter: function()
    {
      var query = {
        _rnd: Math.random(),
        from: null,
        to: null,
        interval: buttonGroup.getValue(this.$id('interval'))
      };

      var range = dateTimeRange.serialize(this);

      var fromMoment = range.from || getFromTimeByInterval(query.interval);
      var toMoment = range.to || time.getMoment();

      query.from = fromMoment.valueOf();
      query.to = toMoment.valueOf();

      this.$id('from-date').val(fromMoment.format('YYYY-MM-DD'));
      this.$id('to-date').val(toMoment.format('YYYY-MM-DD'));

      this.model.set(query, {reset: true});
    }

  });
});
