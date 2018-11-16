// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/core/views/FilterView',
  'app/core/util/forms/dateTimeRange',
  'app/reports/templates/5/filter'
], function(
  _,
  time,
  FilterView,
  dateTimeRange,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    events: _.assign({
      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent,
      'click #-showDisplayOptions': function()
      {
        this.trigger('showDisplayOptions');
      }
    }, FilterView.prototype.events),

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.toggleButtonGroup('interval');
      this.toggleButtonGroup('weekends');
    },

    serializeQueryToForm: function()
    {
      var model = this.model;

      return {
        interval: model.get('interval'),
        weekends: model.get('weekends') ? '1' : '0',
        'from-date': time.format(+model.get('from'), 'YYYY-MM-DD'),
        'to-date': time.format(+model.get('to'), 'YYYY-MM-DD')
      };
    },

    changeFilter: function()
    {
      var query = {
        rnd: Math.random(),
        from: null,
        to: null,
        interval: this.getButtonGroupValue('interval'),
        weekends: this.getButtonGroupValue('weekends')
      };

      var range = dateTimeRange.serialize(this);

      var fromMoment = range.from || this.getFromTimeByInterval(query.interval);
      var toMoment = range.to || time.getMoment();

      query.from = fromMoment.valueOf();
      query.to = toMoment.valueOf();

      this.$id('from-date').val(fromMoment.format('YYYY-MM-DD'));
      this.$id('to-date').val(toMoment.format('YYYY-MM-DD'));

      this.model.set(query);
    },

    getFromTimeByInterval: function(interval)
    {
      var fromMoment = time.getMoment().minutes(0).seconds(0).milliseconds(0);

      switch (interval)
      {
        case 'month':
          return fromMoment.date(1).hours(6).valueOf();

        case 'week':
          return fromMoment.day(1).hours(6).valueOf();

        default:
          return fromMoment.hour(6).valueOf();
      }
    }

  });
});
