// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/core/views/FilterView',
  'app/core/util/fixTimeRange',
  'app/orgUnits/views/OrgUnitPickerView',
  'app/prodLogEntries/templates/filter'
], function(
  user,
  FilterView,
  fixTimeRange,
  OrgUnitPickerView,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    defaultFormData: {
      createdAt: '',
      type: null
    },

    termToForm: {
      'createdAt': function(propertyName, term, formData)
      {
        fixTimeRange.toFormData(formData, term, 'date+time');
      },
      'type': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      }
    },

    initialize: function()
    {
      FilterView.prototype.initialize.apply(this, arguments);

      this.setView('#' + this.idPrefix + '-orgUnit', new OrgUnitPickerView({
        filterView: this
      }));
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.$id('type').select2({
        width: '275px',
        allowClear: true
      });
    },

    serializeFormToQuery: function(selector)
    {
      var timeRange = fixTimeRange.fromView(this, {defaultTime: '06:00'});
      var type = this.$id('type').val();

      if (type && type.length)
      {
        selector.push({name: 'eq', args: ['type', type]});
      }

      if (timeRange.from)
      {
        selector.push({name: 'ge', args: ['createdAt', timeRange.from]});
      }

      if (timeRange.to)
      {
        selector.push({name: 'le', args: ['createdAt', timeRange.to]});
      }
    }

  });
});
