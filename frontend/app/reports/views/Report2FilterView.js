define([
  'underscore',
  'js2form',
  'app/i18n',
  'app/time',
  'app/core/View',
  'app/core/util/fixTimeRange',
  'app/reports/templates/report2Filter'
], function(
  _,
  js2form,
  t,
  time,
  View,
  fixTimeRange,
  filterTemplate
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
      'click .btn[data-range]': function(e)
      {
        /*jshint -W015*/

        var fromMoment = time.getMoment();
        var toMoment;
        var interval;

        switch (e.target.getAttribute('data-range'))
        {
          case 'month':
            fromMoment.date(1);
            toMoment = fromMoment.clone().add('months', 1);
            interval = 'week';
            break;

          case 'week':
            fromMoment.weekday(0);
            toMoment = fromMoment.clone().add('days', 7);
            interval = 'day';
            break;

          case 'today':
            toMoment = fromMoment.clone().add('days', 1);
            interval = 'day';
            break;

          case 'yesterday':
            toMoment = fromMoment.clone();
            fromMoment.subtract('days', 1);
            interval = 'day';
            break;
        }

        this.$id('from').val(fromMoment.format('YYYY-MM-DD'));
        this.$id('to').val(toMoment.format('YYYY-MM-DD'));
        this.$('.btn[data-interval=' + interval + ']').click();
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

      this.$('[name=interval]:checked').closest('.btn').addClass('active');
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
        interval: this.$('.reports-2-filter-intervals > .active > input').val()
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
      return this.$('.reports-2-filter-intervals > .active').attr('data-interval');
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
