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
  'app/qiResults/templates/countReportFilter'
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

      this.$id('kinds').select2({
        width: '215px',
        allowClear: true,
        multiple: true,
        containerCssClass: 'qi-countReport-clipSelect2',
        data: qiDictionaries.kinds.map(idAndLabel)
      });

      this.$id('errorCategories').select2({
        width: '215px',
        allowClear: true,
        multiple: true,
        containerCssClass: 'qi-countReport-clipSelect2',
        data: qiDictionaries.errorCategories.map(idAndLabel)
      });

      this.$id('faultCodes').select2({
        width: '250px',
        allowClear: true,
        multiple: true,
        data: qiDictionaries.faults.map(idAndLabel)
      });
    },

    serializeFormData: function()
    {
      var model = this.model;
      var from = +model.get('from');
      var to = +model.get('to');

      return {
        interval: model.get('interval'),
        from: from ? time.format(from, 'YYYY-MM-DD') : '',
        to: to ? time.format(to, 'YYYY-MM-DD') : '',
        productFamilies: model.get('productFamilies'),
        kinds: model.get('kinds').join(','),
        errorCategories: model.get('errorCategories').join(','),
        faultCodes: model.get('faultCodes').join(',')
      };
    },

    changeFilter: function()
    {
      var query = {
        from: time.getMoment(this.$id('from').val(), 'YYYY-MM-DD').valueOf(),
        to: time.getMoment(this.$id('to').val(), 'YYYY-MM-DD').valueOf(),
        interval: buttonGroup.getValue(this.$id('interval')),
        productFamilies: this.$id('productFamilies').val(),
        kinds: this.$id('kinds').val(),
        errorCategories: this.$id('errorCategories').val(),
        faultCodes: this.$id('faultCodes').val()
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

      query.kinds = query.kinds === '' ? [] : query.kinds.split(',');
      query.errorCategories = query.errorCategories === '' ? [] : query.errorCategories.split(',');
      query.faultCodes = query.faultCodes === '' ? [] : query.faultCodes.split(',');

      this.model.set(query);
      this.model.trigger('filtered');
    }

  });
});
