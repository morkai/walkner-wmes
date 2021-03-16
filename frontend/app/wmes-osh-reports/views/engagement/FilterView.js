// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FilterView',
  'app/core/util/forms/dateTimeRange',
  'app/users/util/setUpUserSelect2',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-common/views/OrgUnitPickerFilterView',
  'app/wmes-osh-reports/templates/engagement/filter',
  'app/core/util/ExpandableSelect'
], function(
  FilterView,
  dateTimeRange,
  setUpUserSelect2,
  dictionaries,
  OrgUnitPickerFilterView,
  template
) {
  'use strict';

  return FilterView.extend({

    template,

    events: Object.assign({

      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent,

      'change input[name="mode"]': function()
      {
        this.toggleMode();
      }

    }, FilterView.prototype.events),

    termToForm: {
      'date': dateTimeRange.rqlToForm,
      'division': (propertyName, term, formData) =>
      {
        formData.mode = 'orgUnit';
      },
      'workplace': 'division',
      'department': 'division',
      'leader': (propertyName, term, formData) =>
      {
        formData[propertyName] = term.args[1];
        formData.mode = 'leader';
      }
    },

    initialize: function()
    {
      FilterView.prototype.initialize.apply(this, arguments);

      this.orgUnitPickerView = new OrgUnitPickerFilterView({
        filterView: this,
        emptyLabel: this.t('wmes-osh-reports', 'filter:orgUnit'),
        orgUnitTypes: ['division', 'workplace', 'department'],
        labelInput: {
          name: 'mode',
          value: 'orgUnit'
        }
      });

      this.setView('#-orgUnit', this.orgUnitPickerView);
    },

    serializeFormToQuery: function(selector)
    {
      dateTimeRange.formToRql(this, selector);

      [
        'leader'
      ].forEach(prop =>
      {
        const $prop = this.$id(prop);
        let value = $prop.val();

        if (!value || !value.length || $prop.prop('disabled'))
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

      setUpUserSelect2(this.$id('leader'), {
        view: this,
        width: '300px'
      });

      this.toggleMode();
    },

    toggleMode: function()
    {
      const mode = this.$('input[name="mode"]:checked').val();

      if (!mode)
      {
        this.$('input[name="mode"]').first().click();

        return;
      }

      this.orgUnitPickerView.toggle(mode === 'orgUnit');

      this.$id('leader').select2('enable', mode === 'leader');
    }

  });
});
