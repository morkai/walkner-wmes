// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FilterView',
  'app/core/util/forms/dateTimeRange',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-common/views/OrgUnitPickerFilterView',
  'app/wmes-osh-reports/templates/observers/filter',
  'app/core/util/ExpandableSelect'
], function(
  FilterView,
  dateTimeRange,
  dictionaries,
  OrgUnitPickerFilterView,
  template
) {
  'use strict';

  return FilterView.extend({

    template,

    nlsDomain: 'wmes-osh-observations',

    events: Object.assign({

      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent

    }, FilterView.prototype.events),

    defaultFormData: function()
    {
      return {

      };
    },

    termToForm: {
      'date': dateTimeRange.rqlToForm
    },

    initialize: function()
    {
      FilterView.prototype.initialize.apply(this, arguments);

      this.setView('#-orgUnit', new OrgUnitPickerFilterView({
        filterView: this,
        emptyLabel: this.t('wmes-osh-reports', 'filter:orgUnit'),
        orgUnitTypes: ['division', 'workplace', 'department']
      }));
    },

    serializeFormToQuery: function(selector)
    {
      dateTimeRange.formToRql(this, selector);

      [

      ].forEach(prop =>
      {
        const $prop = this.$id(prop);
        let value = $prop.val();

        if (!value || !value.length)
        {
          return;
        }

        if (typeof value === 'string')
        {
          value = value.split(',');
        }

        if ($prop[0].tagName === 'SELECT' && $prop[0].options.length === value.length)
        {
          return;
        }

        value = value.map(v => /^[0-9]+$/.test(v) ? parseInt(v, 10) : v);

        if (value.length === 1)
        {
          selector.push({name: 'eq', args: [prop, value[0]]});
        }
        else
        {
          selector.push({name: 'in', args: [prop, value]});
        }
      });
    }

  });
});
