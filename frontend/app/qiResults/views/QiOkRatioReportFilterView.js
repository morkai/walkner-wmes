// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'js2form',
  'app/time',
  'app/core/View',
  'app/core/util/buttonGroup',
  'app/core/util/idAndLabel',
  'app/core/util/forms/dateTimeRange',
  'app/qiResults/dictionaries',
  'app/qiResults/templates/okRatioReportFilter'
], function(
  js2form,
  time,
  View,
  buttonGroup,
  idAndLabel,
  dateTimeRange,
  qiDictionaries,
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
    },

    serializeFormData: function()
    {
      var model = this.model;
      var from = +model.get('from');
      var to = +model.get('to');

      return {
        'from-date': from ? time.format(from, 'YYYY-MM') : '',
        'to-date': to ? time.format(to, 'YYYY-MM') : ''
      };
    },

    changeFilter: function()
    {
      var range = dateTimeRange.serialize(this);
      var query = {
        from: range.from ? range.from.valueOf() : 0,
        to: range.to ? range.to.valueOf() : 0
      };

      this.model.set(query);
      this.model.trigger('filtered');
    }

  });
});
