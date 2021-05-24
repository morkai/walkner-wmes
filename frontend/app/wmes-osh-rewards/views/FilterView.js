// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/core/views/FilterView',
  'app/core/util/forms/dateTimeRange',
  'app/users/util/setUpUserSelect2',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-common/views/OrgUnitPickerFilterView',
  'app/wmes-osh-rewards/Reward',
  'app/wmes-osh-rewards/templates/filter'
], function(
  currentUser,
  FilterView,
  dateTimeRange,
  setUpUserSelect2,
  dictionaries,
  OrgUnitPickerFilterView,
  Reward,
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

    filterMap: {
      createdAt: 'date',
      paidAt: 'date'
    },

    defaultFormData: function()
    {
      return {
        dateFilter: 'createdAt'
      };
    },

    termToForm: {
      'createdAt': dateTimeRange.rqlToForm,
      'paidAt': dateTimeRange.rqlToForm,
      'division': (propertyName, term, formData) =>
      {
        formData.mode = 'orgUnit';
      },
      'workplace': 'division',
      'department': 'division',
      'paid': (propertyName, term, formData) =>
      {
        formData.status = term.args[1] ? 'paid' : 'unpaid';
      },
      'leader': (propertyName, term, formData) =>
      {
        formData[propertyName] = term.args[1];
        formData.mode = 'leader';
      },
      'employee': (propertyName, term, formData) =>
      {
        formData[propertyName] = term.args[1];
        formData.mode = 'employee';
      }
    },

    initialize: function()
    {
      FilterView.prototype.initialize.apply(this, arguments);

      if (Reward.can.viewAll())
      {
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
      }
    },

    serializeFormToQuery: function(selector, rqlQuery)
    {
      const dateFilter = this.$('input[name="dateFilter"]:checked').val();

      rqlQuery.sort = {};
      rqlQuery.sort[dateFilter] = -1;

      dateTimeRange.formToRql(this, selector);

      const status = this.$id('status').val();

      if (status === 'paid')
      {
        selector.push({name: 'eq', args: ['paid', true]});
      }
      else if (status === 'unpaid')
      {
        selector.push({name: 'eq', args: ['paid', false]});
      }

      const mode = this.$('input[name="mode"]:checked').val();

      if (mode !== 'orgUnit')
      {
        if (Reward.can.viewAll())
        {
          const value = this.$id(mode).val();

          if (value)
          {
            selector.push({name: 'eq', args: [mode, value]});
          }
        }
        else
        {
          selector.push({name: 'eq', args: [mode, currentUser.data._id]});
        }
      }
    },

    getTemplateData: function()
    {
      return {
        showOrgUnitFilter: Reward.can.viewAll()
      };
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      setUpUserSelect2(this.$id('leader'), {
        view: this,
        width: '300px'
      });

      setUpUserSelect2(this.$id('employee'), {
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

      if (Reward.can.viewAll())
      {
        this.orgUnitPickerView.toggle(mode === 'orgUnit');
        this.$id('leader').select2('enable', mode === 'leader');
        this.$id('employee').select2('enable', mode === 'employee');
      }
      else
      {
        const data = setUpUserSelect2.userToData(Object.assign({}, currentUser.data));

        this.$id('leader').select2('data', data).select2('enable', false);
        this.$id('employee').select2('data', data).select2('enable', false);
      }
    }

  });
});
