// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/core/views/FilterView',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-common/views/OrgUnitPickerFilterView',
  'app/wmes-osh-reports/templates/metrics/filter',
  'app/core/util/ExpandableSelect'
], function(
  time,
  FilterView,
  dictionaries,
  OrgUnitPickerFilterView,
  template
) {
  'use strict';

  return FilterView.extend({

    template,

    events: Object.assign({

    }, FilterView.prototype.events),

    defaultFormData: function()
    {
      return {
        month: time.getMoment().format('YYYY-MM')
      };
    },

    termToForm: {
      'month': (propertyName, term, formData) =>
      {
        formData.month = term.args[1];
      }
    },

    initialize: function()
    {
      FilterView.prototype.initialize.apply(this, arguments);

      this.setView('#-orgUnit', new OrgUnitPickerFilterView({
        filterView: this,
        emptyLabel: this.t('wmes-osh-reports', 'filter:orgUnit'),
        orgUnitTypes: ['division', 'workplace', 'department'],
        multiple: false
      }));
    },

    destroy: function()
    {
      FilterView.prototype.destroy.call(this);

      this.$('.is-expandable').expandableSelect('destroy');
    },

    getTemplateData: function()
    {
      return {

      };
    },

    serializeFormToQuery: function(selector)
    {
      [
        'month'
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
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.$('.is-expandable').expandableSelect();
    }

  });
});
