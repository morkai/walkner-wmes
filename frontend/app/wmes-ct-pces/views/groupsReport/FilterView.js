// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'js2form',
  'app/time',
  'app/core/View',
  'app/core/util/idAndLabel',
  'app/core/util/forms/dateTimeRange',
  'app/wmes-ct-pces/templates/groupsReport/filter'
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
        lines: model.get('lines').join(','),
        minQty: model.get('minQty') || '',
        maxQty: model.get('maxQty') || '',
        minT: model.get('minT') || '',
        maxT: model.get('maxT') || ''
      };
    },

    changeFilter: function()
    {
      var view = this;
      var range = dateTimeRange.serialize(view);
      var query = {
        from: range.from ? range.from.valueOf() : 0,
        to: range.to ? range.to.valueOf() : 0,
        lines: view.$id('lines').val().split(',').filter(function(v) { return !!v; }),
        minQty: parseInt(view.$id('minQty').val(), 10) || '',
        maxQty: parseInt(view.$id('maxQty').val(), 10) || '',
        minT: view.$id('minT').val().trim(),
        maxT: view.$id('maxT').val().trim()
      };

      view.model.set(query);
      view.model.trigger('filtered');
    }

  });
});
