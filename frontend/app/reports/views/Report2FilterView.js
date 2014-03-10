define([
  'underscore',
  'js2form',
  'app/i18n',
  'app/time',
  'app/core/View',
  'app/core/util/fixTimeRange',
  'app/reports/templates/report2Filter',
  './prepareDateRange'
], function(
  _,
  js2form,
  t,
  time,
  View,
  fixTimeRange,
  filterTemplate,
  prepareDateRange
) {
  'use strict';

  return View.extend({

    template: filterTemplate,

    events: {
      'submit .filter-form': function(e)
      {
        e.preventDefault();

        this.changeFilter();
      },
      'click a[data-range]': function(e)
      {
        /*jshint -W015*/

        var dateRange = prepareDateRange(e.target.getAttribute('data-range'));

        this.$id('from').val(dateRange.fromMoment.format('YYYY-MM-DD'));
        this.$id('to').val(dateRange.toMoment.format('YYYY-MM-DD'));
        this.$('.btn[data-interval="' + dateRange.interval + '"]').click();
        this.$('.filter-form').submit();
      }
    },

    initialize: function()
    {
      this.idPrefix = _.uniqueId('report2Filter');
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix
      };
    },

    afterRender: function()
    {
      var formData = this.serializeFormData();

      js2form(this.el.querySelector('.filter-form'), formData);

      this.$('input[name=interval]:checked').closest('.btn').addClass('active');
    },

    serializeFormData: function()
    {
      return {
        interval: this.model.get('interval'),
        from: time.format(Number(this.model.get('from')), 'YYYY-MM-DD'),
        to: time.format(Number(this.model.get('to')), 'YYYY-MM-DD')
      };
    },

    changeFilter: function()
    {
      var query = {
        rnd: Math.random(),
        from: null,
        to: null,
        interval: this.$id('intervals').find('.active > input').val()
      };

      var timeRange = fixTimeRange.fromView(this);

      query.from = timeRange.from || this.getFromMomentForSelectedInterval().valueOf();
      query.to = timeRange.to || Date.now();

      this.$id('from').val(time.format(query.from, 'YYYY-MM-DD'));
      this.$id('to').val(time.format(query.to, 'YYYY-MM-DD'));

      this.model.set(query);
    },

    getSelectedInterval: function()
    {
      return this.$id('intervals').find('.active').attr('data-interval');
    },

    getFromMomentForSelectedInterval: function()
    {
      /*jshint -W015*/

      var fromMoment = time.getMoment().minutes(0).seconds(0).milliseconds(0);

      switch (this.getSelectedInterval())
      {
        case 'month':
          return fromMoment.date(1).hours(6);

        case 'week':
          return fromMoment.day(1).hours(6);

        default:
          return fromMoment.hour(6);
      }
    }

  });
});
