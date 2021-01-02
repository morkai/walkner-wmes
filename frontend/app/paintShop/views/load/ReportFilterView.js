// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'js2form',
  'app/time',
  'app/core/View',
  'app/core/util/getShiftStartInfo',
  'app/core/util/buttonGroup',
  'app/core/util/forms/dateTimeRange',
  'app/paintShop/templates/load/reportFilter'
], function(
  js2form,
  time,
  View,
  getShiftStartInfo,
  buttonGroup,
  dateTimeRange,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent,
      'submit': function()
      {
        this.changeFilter();

        return false;
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
        'from-date': from ? time.format(from, 'YYYY-MM-DD') : '',
        'to-date': to ? time.format(to, 'YYYY-MM-DD') : ''
      };
    },

    changeFilter: function()
    {
      var range = dateTimeRange.serialize(this);
      var query = {
        from: range.from ? range.from.valueOf() : 0,
        to: range.to ? range.to.valueOf() : 0,
        interval: buttonGroup.getValue(this.$id('interval'))
      };

      if (query.interval === 'none')
      {
        if (!query.from)
        {
          query.from = getShiftStartInfo(Date.now()).moment.startOf('day').valueOf();
        }

        query.to = time.getMoment(query.from).add(1, 'days').valueOf();
      }

      if (query.from && query.to && query.to <= query.from)
      {
        query.to = time.getMoment(query.from).add(1, query.interval === 'none' ? 'day' : query.interval).valueOf();
      }

      if (query.from)
      {
        this.$id('from-date').val(time.format(query.from, 'YYYY-MM-DD'));
      }

      if (query.to)
      {
        this.$id('to-date').val(time.format(query.to, 'YYYY-MM-DD'));
      }

      this.model.set(query);
      this.model.trigger('filtered');
    }

  });
});
