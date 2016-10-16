// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'js2form',
  'app/time',
  'app/core/View',
  'app/core/util/fixTimeRange',
  'app/core/util/buttonGroup',
  'app/core/util/idAndLabel',
  'app/reports/util/prepareDateRange',
  'app/qiResults/dictionaries',
  'app/qiResults/templates/okRatioReportFilter'
], function(
  js2form,
  time,
  View,
  fixTimeRange,
  buttonGroup,
  idAndLabel,
  prepareDateRange,
  qiDictionaries,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'submit': function()
      {
        this.changeFilter();

        return false;
      },
      'click a[data-range]': function(e)
      {
        var dateRange = prepareDateRange(e.target);

        this.$id('from').val(dateRange.fromMoment.format('YYYY-MM'));
        this.$id('to').val(dateRange.toMoment.format('YYYY-MM'));
        this.$el.submit();
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
        from: from ? time.format(from, 'YYYY-MM') : '',
        to: to ? time.format(to, 'YYYY-MM') : ''
      };
    },

    changeFilter: function()
    {
      var query = {
        from: time.getMoment(this.$id('from').val(), 'YYYY-MM').valueOf(),
        to: time.getMoment(this.$id('to').val(), 'YYYY-MM').valueOf()
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
        var to = time.getMoment(query.to).add(1, 'months');

        this.$id('to').val(to.format('YYYY-MM'));

        query.to = to.valueOf();
      }

      this.model.set(query);
      this.model.trigger('filtered');
    }

  });
});
