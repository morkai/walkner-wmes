// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/time',
  'app/core/views/FilterView',
  'app/core/util/fixTimeRange',
  '../util/prepareDateRange',
  'app/reports/templates/report5Filter'
], function(
  _,
  time,
  FilterView,
  fixTimeRange,
  prepareDateRange,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    events: _.extend({}, FilterView.prototype.events, {
      'click a[data-range]': function(e)
      {
        var dateRange = prepareDateRange(e.target.getAttribute('data-range'));

        this.$id('from').val(dateRange.fromMoment.format('YYYY-MM-DD'));
        this.$id('to').val(dateRange.toMoment.format('YYYY-MM-DD'));
        this.$('.btn[data-interval="' + dateRange.interval + '"]:not(.active)').click();
        this.$el.submit();
      },
      'click #-showDisplayOptions': function()
      {
        this.trigger('showDisplayOptions');
      }
    }),

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
        from: time.format(Number(model.get('from')), 'YYYY-MM-DD'),
        to: time.format(Number(model.get('to')), 'YYYY-MM-DD')
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

      var timeRange = fixTimeRange.fromView(this);

      query.from = timeRange.from || this.getFromTimeByInterval(query.interval).valueOf();
      query.to = timeRange.to || Date.now();

      this.$id('from').val(time.format(query.from, 'YYYY-MM-DD'));
      this.$id('to').val(time.format(query.to, 'YYYY-MM-DD'));

      this.model.set(query);
    },

    getFromTimeByInterval: function(interval)
    {
      /*jshint -W015*/

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
