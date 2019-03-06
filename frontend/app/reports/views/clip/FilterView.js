// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'js2form',
  'app/time',
  'app/core/View',
  'app/core/util/forms/dateTimeRange',
  'app/reports/templates/clip/filter'
], function(
  js2form,
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
      'submit': function(e)
      {
        e.preventDefault();

        this.changeFilter();
      },
      'click #-showDisplayOptions': function()
      {
        this.trigger('showDisplayOptions');
      }
    },

    initialize: function()
    {
      this.listenTo(this.settings, 'change', this.onSettingChange);
    },

    afterRender: function()
    {
      var formData = this.serializeFormData();

      js2form(this.el, formData);

      this.$('input[name="interval"]:checked').closest('.btn').addClass('active');
    },

    serializeFormData: function()
    {
      return {
        interval: this.model.get('interval'),
        'from-date': time.format(Number(this.model.get('from')), 'YYYY-MM-DD'),
        'to-date': time.format(Number(this.model.get('to')), 'YYYY-MM-DD')
      };
    },

    changeFilter: function()
    {
      var view = this;
      var query = {
        rnd: Math.random(),
        from: null,
        to: null,
        interval: view.$id('intervals').find('.active > input').val(),
        skip: 0
      };

      var range = dateTimeRange.serialize(this);

      var fromMoment = range.from || this.getFromMomentForSelectedInterval();
      var toMoment = range.to || time.getMoment();

      query.from = fromMoment.valueOf();
      query.to = toMoment.valueOf();

      view.$id('from-date').val(fromMoment.format('YYYY-MM-DD'));
      view.$id('to-date').val(toMoment.format('YYYY-MM-DD'));

      view.model.set(query);
    },

    getSelectedInterval: function()
    {
      return this.$id('intervals').find('.active').attr('data-interval');
    },

    getFromMomentForSelectedInterval: function()
    {
      var fromMoment = time.getMoment().startOf('hour');

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
