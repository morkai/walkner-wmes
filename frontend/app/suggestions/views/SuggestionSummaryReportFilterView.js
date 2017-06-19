// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'js2form',
  'app/time',
  'app/core/View',
  'app/core/util/fixTimeRange',
  'app/core/util/idAndLabel',
  'app/users/util/setUpUserSelect2',
  'app/kaizenOrders/dictionaries',
  'app/suggestions/templates/summaryReportFilter',
  'app/reports/util/prepareDateRange'
], function(
  js2form,
  time,
  View,
  fixTimeRange,
  idAndLabel,
  setUpUserSelect2,
  kaizenDictionaries,
  template,
  prepareDateRange
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

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        showProductFamily: !!this.options.productFamily
      };
    },

    afterRender: function()
    {
      js2form(this.el, this.serializeFormData());

      this.$id('section').select2({
        width: '300px',
        allowClear: true,
        multiple: true,
        data: kaizenDictionaries.sections.map(idAndLabel)
      });

      if (this.options.productFamily)
      {
        this.$id('productFamily').select2({
          width: '300px',
          allowClear: true,
          multiple: true,
          data: kaizenDictionaries.productFamilies.map(idAndLabel)
        });
      }

      setUpUserSelect2(this.$id('confirmer'), {
        width: '400px',
        multiple: true,
        view: this
      });
    },

    serializeFormData: function()
    {
      var model = this.model;
      var from = +model.get('from');
      var to = +model.get('to');

      return {
        from: from ? time.format(from, 'YYYY-MM-DD') : '',
        to: to ? time.format(to, 'YYYY-MM-DD') : '',
        section: model.get('section').join(','),
        productFamily: (model.get('productFamily') || []).join(','),
        confirmer: model.get('confirmer').join(',')
      };
    },

    changeFilter: function()
    {
      var query = {
        from: time.getMoment(this.$id('from').val(), 'YYYY-MM-DD').valueOf(),
        to: time.getMoment(this.$id('to').val(), 'YYYY-MM-DD').valueOf(),
        section: [],
        productFamily: [],
        confirmer: []
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

      ['section', 'productFamily', 'confirmer'].forEach(function(p)
      {
        var v = this.$id(p).val();

        if (v)
        {
          query[p] = v.split(',');
        }
      }, this);

      this.model.set(query);
      this.model.trigger('filtered');
    }

  });
});
