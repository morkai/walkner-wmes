// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'js2form',
  'app/time',
  'app/core/View',
  'app/core/util/buttonGroup',
  'app/core/util/idAndLabel',
  'app/core/util/forms/dateTimeRange',
  'app/qiResults/dictionaries',
  'app/qiResults/templates/countReportFilter'
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

      buttonGroup.toggle(this.$id('interval'));

      this.$id('productFamilies').select2({
        width: '190px',
        allowClear: true,
        multiple: true,
        data: qiDictionaries.productFamilies.map(function(d) { return {id: d, text: d}; })
      });

      this.$id('kinds').select2({
        width: '200px',
        allowClear: true,
        multiple: true,
        containerCssClass: 'qi-countReport-clipSelect2',
        data: qiDictionaries.kinds.map(idAndLabel)
      });

      this.$id('errorCategories').select2({
        width: '180px',
        allowClear: true,
        multiple: true,
        data: qiDictionaries.errorCategories.map(idAndLabel)
      });

      this.$id('faultCodes').select2({
        width: '180px',
        allowClear: true,
        multiple: true,
        data: qiDictionaries.faults.map(idAndLabel)
      });

      this.$id('inspector').select2({
        width: '200px',
        allowClear: true,
        placeholder: ' ',
        data: qiDictionaries.inspectors.map(idAndLabel)
      });
    },

    serializeFormData: function()
    {
      var model = this.model;
      var from = +model.get('from');
      var to = +model.get('to');

      return {
        interval: model.get('interval'),
        'from-date': from ? time.format(from, 'YYYY-MM-DD') : '',
        'to-date': to ? time.format(to, 'YYYY-MM-DD') : '',
        productFamilies: model.get('productFamilies'),
        kinds: model.get('kinds').join(','),
        errorCategories: model.get('errorCategories').join(','),
        faultCodes: model.get('faultCodes').join(','),
        inspector: model.get('inspector')
      };
    },

    changeFilter: function()
    {
      var range = dateTimeRange.serialize(this);
      var query = {
        from: range.from ? range.from.valueOf() : 0,
        to: range.to ? range.to.valueOf() : 0,
        interval: buttonGroup.getValue(this.$id('interval')),
        productFamilies: this.$id('productFamilies').val(),
        kinds: this.$id('kinds').val(),
        errorCategories: this.$id('errorCategories').val(),
        faultCodes: this.$id('faultCodes').val(),
        inspector: this.$id('inspector').val()
      };

      query.kinds = query.kinds === '' ? [] : query.kinds.split(',');
      query.errorCategories = query.errorCategories === '' ? [] : query.errorCategories.split(',');
      query.faultCodes = query.faultCodes === '' ? [] : query.faultCodes.split(',');

      this.model.set(query);
      this.model.trigger('filtered');
    }

  });
});
