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

    defaultFormData: {
      type: ['kaizen', 'observation'],
      company: ''
    },

    termToForm: {
      'division': (propertyName, term, formData) =>
      {
        formData.mode = 'orgUnit';
      },
      'workplace': 'division',
      'department': 'division',
      'type': (propertyName, term, formData) =>
      {
        formData[propertyName] = term.args[1];
      },
      'status': 'type',
      'paidAt': 'type',
      'employee': (propertyName, term, formData) =>
      {
        formData[propertyName] = term.args[1];
        formData.mode = 'employee';
      },
      'company': (propertyName, term, formData) =>
      {
        formData[propertyName] = term.args[1].join(',');
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

      const type = this.$id('type').val() || [];

      if (type.length && type.length !== this.$id('type')[0].length)
      {
        selector.push({name: 'in', args: ['type', type]});
      }

      const company = this.$id('company').select2('data');

      if (company.length)
      {
        selector.push({name: 'in', args: ['company', company.map(c => c.id)]});
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

      this.$('.is-expandable').expandableSelect();

      setUpUserSelect2(this.$id('employee'), {
        view: this,
        width: '300px'
      });

      this.setUpCompanySelect2();
      this.toggleMode();
      this.toggleDate();
    },

    setUpCompanySelect2: function()
    {
      this.$id('company').select2({
        width: '300px',
        multiple: true,
        placeholder: ' ',
        data: dictionaries.settings.getValue('rewards.companies', [])
      });
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
        this.$id('employee').select2('enable', mode === 'employee');
      }
      else
      {
        const data = setUpUserSelect2.userToData(Object.assign({}, currentUser.data));

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
