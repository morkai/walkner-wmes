// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'js2form',
  'app/time',
  'app/core/View',
  'app/core/util/idAndLabel',
  'app/core/util/forms/dateTimeRange',
  'app/users/util/setUpUserSelect2',
  'app/kaizenOrders/dictionaries',
  'app/suggestions/templates/summaryReportFilter'
], function(
  js2form,
  time,
  View,
  idAndLabel,
  dateTimeRange,
  setUpUserSelect2,
  kaizenDictionaries,
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

    getTemplateData: function()
    {
      return {
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
        'from-date': from ? time.format(from, 'YYYY-MM-DD') : '',
        'to-date': to ? time.format(to, 'YYYY-MM-DD') : '',
        section: model.get('section').join(','),
        productFamily: (model.get('productFamily') || []).join(','),
        confirmer: model.get('confirmer').join(',')
      };
    },

    changeFilter: function()
    {
      var range = dateTimeRange.serialize(this);
      var query = {
        from: range.from ? range.from.valueOf() : 0,
        to: range.to ? range.to.valueOf() : 0,
        section: [],
        productFamily: [],
        confirmer: []
      };

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
