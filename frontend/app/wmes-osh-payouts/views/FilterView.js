// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/core/views/FilterView',
  'app/core/util/forms/dateTimeRange',
  'app/users/util/setUpUserSelect2',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-payouts/Payout',
  'app/wmes-osh-payouts/templates/filter',
  'app/core/util/ExpandableSelect'
], function(
  currentUser,
  FilterView,
  dateTimeRange,
  setUpUserSelect2,
  dictionaries,
  Payout,
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

    defaultFormData: function()
    {
      return {
        types: ['kaizen', 'observation']
      };
    },

    termToForm: {
      'createdAt': dateTimeRange.rqlToForm,
      'recipients.id': (propertyName, term, formData) =>
      {
        formData.recipient = term.args[1];
      },
      'companies.id': (propertyName, term, formData) =>
      {
        formData.companies = term.args[1].join(',');
      },
      'types': (propertyName, term, formData) =>
      {
        formData[propertyName] = term.args[1];
      }
    },

    initialize: function()
    {
      FilterView.prototype.initialize.apply(this, arguments);

      this.once('afterRender', () =>
      {
        this.listenTo(this.companies, 'reset', this.setUpCompaniesSelect2);
      });
    },

    serializeFormToQuery: function(selector)
    {
      dateTimeRange.formToRql(this, selector);

      const recipient = this.$id('recipient').val();

      if (recipient.length)
      {
        selector.push({name: 'eq', args: ['recipients.id', recipient]});
      }

      const types = this.$id('types').val() || [];

      if (types.length && types.length !== this.$id('types')[0].length)
      {
        selector.push({name: 'in', args: ['types', types]});
      }

      const companies = this.$id('companies').select2('data') || [];

      if (companies.length)
      {
        selector.push({name: 'in', args: ['companies.id', companies.map(c => c.id)]});
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.$('.is-expandable').expandableSelect();

      setUpUserSelect2(this.$id('recipient'), {
        view: this,
        width: '300px'
      });

      this.setUpCompaniesSelect2();
    },

    setUpCompaniesSelect2: function()
    {
      this.$id('companies').select2({
        width: '300px',
        multiple: true,
        placeholder: ' ',
        data: this.companies.map(c => ({
          id: c.id,
          text: c.get('label')
        }))
      });
    }

  });
});
