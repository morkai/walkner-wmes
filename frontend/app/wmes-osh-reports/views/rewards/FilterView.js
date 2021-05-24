// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/core/views/FilterView',
  'app/users/util/setUpUserSelect2',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-common/views/OrgUnitPickerFilterView',
  'app/wmes-osh-reports/templates/rewards/filter'
], function(
  currentUser,
  FilterView,
  setUpUserSelect2,
  dictionaries,
  OrgUnitPickerFilterView,
  template
) {
  'use strict';

  return FilterView.extend({

    template,

    events: Object.assign({

      'change input[name="mode"]': function()
      {
        this.toggleMode();
      },

      'change select[name="status"]': function()
      {
        this.toggleDate();
      }

    }, FilterView.prototype.events),

    termToForm: {
      'division': (propertyName, term, formData) =>
      {
        formData.mode = 'orgUnit';
      },
      'workplace': 'division',
      'department': 'division',
      'status': (propertyName, term, formData) =>
      {
        formData[propertyName] = term.args[1];
      },
      'paidAt': 'status',
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

      if (this.canViewAll())
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

    serializeFormToQuery: function(selector)
    {
      const status = this.$id('status').val();

      selector.push({name: 'eq', args: ['status', status]});

      if (status === 'paid')
      {
        const paidAt = this.$id('paidAt').val();

        if (paidAt)
        {
          selector.push({name: 'eq', args: ['paidAt', paidAt]});
        }
      }

      const mode = this.$('input[name="mode"]:checked').val();

      if (mode !== 'orgUnit')
      {
        if (this.canViewAll())
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
        showOrgUnitFilter: this.canViewAll()
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
      this.toggleDate();
    },

    toggleMode: function()
    {
      const mode = this.$('input[name="mode"]:checked').val();

      if (!mode)
      {
        this.$('input[name="mode"]').first().click();

        return;
      }

      if (this.canViewAll())
      {
        this.orgUnitPickerView.toggle(mode === 'orgUnit');
        this.$id('leader').select2('enable', mode === 'leader');
        this.$id('employee').select2('enable', mode === 'employee');
      }
      else
      {
        const data = setUpUserSelect2.userToData({...currentUser.data});

        this.$id('leader').select2('data', data).select2('enable', false);
        this.$id('employee').select2('data', data).select2('enable', false);
      }
    },

    toggleDate: function()
    {
      const hidden = this.$('select[name="status"]').val() !== 'paid';

      this.$id('paidAtGroup').toggleClass('hidden', hidden);

      if (hidden)
      {
        this.$id('paidAt').val('');
      }
    },

    canViewAll: function()
    {
      return currentUser.isAllowedTo('OSH:REWARDS:VIEW') || dictionaries.isCoordinator();
    }

  });
});
