// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'js2form',
  'app/time',
  'app/core/View',
  'app/core/util/fixTimeRange',
  'app/core/util/idAndLabel',
  'app/core/util/ExpandableSelect',
  'app/reports/util/prepareDateRange',
  'app/kaizenOrders/dictionaries',
  'app/kaizenOrders/templates/metricsReportFilter'
], function(
  js2form,
  time,
  View,
  fixTimeRange,
  idAndLabel,
  ExpandableSelect,
  prepareDateRange,
  kaizenDictionaries,
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

        this.$id('from').val(dateRange.fromMoment.format('YYYY-MM-DD'));
        this.$id('to').val(dateRange.toMoment.format('YYYY-MM-DD'));
        this.$el.submit();
      }
    },

    destroy: function()
    {
      this.$('.is-expandable').expandableSelect('destroy');
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        statuses: kaizenDictionaries.statuses
      };
    },

    afterRender: function()
    {
      js2form(this.el, this.serializeFormData());

      this.$id('sections').select2({
        width: '350px',
        allowClear: true,
        multiple: true,
        data: kaizenDictionaries.sections.map(idAndLabel)
      });

      this.$('.is-expandable').expandableSelect();
    },

    serializeFormData: function()
    {
      var model = this.model;
      var from = +model.get('from');
      var to = +model.get('to');

      return {
        from: from ? time.format(from, 'YYYY-MM-DD') : '',
        to: to ? time.format(to, 'YYYY-MM-DD') : '',
        status: model.get('status').join(','),
        sections: model.get('sections').join(',')
      };
    },

    changeFilter: function()
    {
      var query = {
        from: time.getMoment(this.$id('from').val(), 'YYYY-MM-DD').valueOf(),
        to: time.getMoment(this.$id('to').val(), 'YYYY-MM-DD').valueOf(),
        status: this.$id('status').val() || [],
        sections: this.$id('sections').val()
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

      query.sections = query.sections === '' ? [] : query.sections.split(',');

      this.model.set(query);
      this.model.trigger('filtered');
    }

  });
});
