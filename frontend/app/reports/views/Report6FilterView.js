// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'js2form',
  'app/time',
  'app/core/View',
  'app/core/util/fixTimeRange',
  'app/core/util/buttonGroup',
  'app/reports/templates/6/filter',
  '../util/prepareDateRange',
  '../util/getFromTimeByInterval'
], function(
  js2form,
  time,
  View,
  fixTimeRange,
  buttonGroup,
  template,
  prepareDateRange,
  getFromTimeByInterval
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'submit': function(e)
      {
        e.preventDefault();

        this.changeFilter();
      },
      'click a[data-range]': function(e)
      {
        var dateRange = prepareDateRange(e.target);

        this.$id('from').val(dateRange.fromMoment.format('YYYY-MM-DD'));
        this.$id('to').val(dateRange.toMoment.format('YYYY-MM-DD'));
        this.$('.btn[data-interval="' + dateRange.interval + '"]').click();
        this.$el.submit();
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
        from: time.format(+this.model.get('from'), 'YYYY-MM-DD'),
        to: time.format(+this.model.get('to'), 'YYYY-MM-DD')
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

      var timeRange = fixTimeRange.fromView(this);

      query.from = timeRange.from || getFromTimeByInterval(query.interval);
      query.to = timeRange.to || Date.now();

      this.$id('from').val(time.format(query.from, 'YYYY-MM-DD'));
      this.$id('to').val(time.format(query.to, 'YYYY-MM-DD'));

      this.model.set(query, {reset: true});
    }

  });
});
