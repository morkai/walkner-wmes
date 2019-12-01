// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'js2form',
  'app/time',
  'app/core/View',
  'app/core/util/idAndLabel',
  'app/core/util/forms/dateTimeRange',
  'app/wmes-ct-pces/templates/pceReport/filter'
], function(
  js2form,
  time,
  View,
  idAndLabel,
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

      this.$id('lines').select2({
        width: '300px',
        multiple: true,
        allowClear: true,
        placeholder: ' ',
        data: this.lines.map(idAndLabel)
      });
    },

    serializeFormData: function()
    {
      var model = this.model;
      var from = +model.get('from');
      var to = +model.get('to');

      return {
        'from-date': from ? time.format(from, 'YYYY-MM-DD') : '',
        'to-date': to ? time.format(to, 'YYYY-MM-DD') : '',
        orders: model.get('orders').join(', '),
        lines: model.get('lines').join(',')
      };
    },

    changeFilter: function()
    {
      var view = this;
      var range = dateTimeRange.serialize(view);
      var query = {
        from: range.from ? range.from.valueOf() : 0,
        to: range.to ? range.to.valueOf() : 0,
        orders: view.$id('orders')
          .val()
          .split(',')
          .map(function(v) { return v.trim(); })
          .filter(function(v) { return /^([0-9]{9}|[0-9]{12}|[A-Za-z0-9]{7})$/.test(v); }),
        lines: view.$id('lines').val().split(',').filter(function(v) { return !!v; })
      };

      view.model.set(query);
      view.model.trigger('filtered');
    }

  });
});
