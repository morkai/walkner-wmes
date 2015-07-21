// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'js2form',
  'app/time',
  'app/core/View',
  'app/core/util/fixTimeRange',
  'app/core/util/buttonGroup',
  'app/kaizenOrders/templates/reportFilter',
  'app/reports/util/prepareDateRange'
], function(
  js2form,
  time,
  View,
  fixTimeRange,
  buttonGroup,
  filterTemplate,
  prepareDateRange
) {
  'use strict';

  return View.extend({

    template: filterTemplate,

    events: {
      'submit': function()
      {
        this.changeFilter();

        return false;
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
      js2form(this.el, this.serializeFormData());

      buttonGroup.toggle(this.$id('interval'));
    },

    serializeFormData: function()
    {
      var model = this.model;
      var from = +model.get('from');
      var to = +model.get('to');

      return {
        interval: model.get('interval'),
        from: from ? time.format(from, 'YYYY-MM-DD') : '',
        to: to ? time.format(to, 'YYYY-MM-DD') : ''
      };
    },

    changeFilter: function()
    {
      var query = {
        from: time.getMoment(this.$id('from').val(), 'YYYY-MM-DD').valueOf(),
        to: time.getMoment(this.$id('to').val(), 'YYYY-MM-DD').valueOf(),
        interval: buttonGroup.getValue(this.$id('interval'))
      };

      if (!query.from || query.from < 0)
      {
        query.from = 0;
      }

      if (!query.to || query.to < 0)
      {
        query.to = 0;
      }

      if (query.from && query.from === query.to)
      {
        var to = time.getMoment(query.to).add(1, 'days');

        this.$id('to').val(to.format('YYYY-MM-DD'));

        query.to = to.valueOf();
      }

      this.model.set(query);
      this.model.trigger('filtered');
    }

  });
});
