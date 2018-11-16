// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/core/views/FilterView',
  'app/core/util/forms/dateTimeRange',
  'app/users/util/setUpUserSelect2',
  'app/orgUnits/views/OrgUnitPickerView',
  'app/pressWorksheets/templates/filter'
], function(
  _,
  time,
  FilterView,
  dateTimeRange,
  setUpUserSelect2,
  OrgUnitPickerView,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    events: _.assign({

      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent

    }, FilterView.prototype.events),

    defaultFormData: function()
    {
      return {
        shift: 0,
        type: 'any',
        mine: false,
        userType: 'operators',
        user: {
          id: null,
          text: null
        }
      };
    },

    termToForm: {
      'date': dateTimeRange.rqlToForm,
      'shift': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'divisions': function(propertyName, term, formData)
      {
        formData.divisions = term.name === 'in' ? term.args[1] : [term.args[1]];
      },
      'master.id': function(propertyName, term, formData)
      {
        formData.userType = propertyName.split('.')[0];
        formData.user.id = term.args[1];

        if (formData.user.text === null)
        {
          formData.user.text = term.args[1];
        }
      },
      'user': function(propertyName, term, formData)
      {
        formData.user.text = term.args[1];
      },
      'type': 'shift',
      'mine': 'shift',
      'operator.id': 'master.id',
      'operators.id': 'master.id'
    },

    initialize: function()
    {
      FilterView.prototype.initialize.apply(this, arguments);

      this.setView('#-orgUnit', new OrgUnitPickerView({
        subdivisionFilter: ['press', 'paintShop'],
        orgUnitLabels: {
          prodLine: this.t('pressWorksheets', 'filter:machine')
        },
        orgUnitTerms: {
          divisions: 'division',
          prodLines: 'prodLine'
        },
        orgUnitTypes: ['division', 'prodLine'],
        filterView: this
      }));
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.toggleButtonGroup('shift');
      this.toggleButtonGroup('type');
      this.toggleButtonGroup('mine');

      setUpUserSelect2(this.$id('user')).select2(
        'data', this.formData.user.id === null ? null : this.formData.user
      );
    },

    serializeFormToQuery: function(selector)
    {
      var shiftNo = parseInt(this.$('input[name=shift]:checked').val(), 10);
      var type = this.$('input[name=type]:checked').val();
      var mine = this.$('input[name=mine]:checked').val();
      var userType = this.$('input[name=userType]:checked').val();
      var user = this.$id('user').select2('data');

      dateTimeRange.formToRql(this, selector);

      if (shiftNo !== 0)
      {
        selector.push({name: 'eq', args: ['shift', shiftNo]});
      }

      if (type !== 'any')
      {
        selector.push({name: 'eq', args: ['type', type]});
      }

      if (user)
      {
        selector.push({name: 'eq', args: [userType + '.id', user.id]});
        selector.push({name: 'eq', args: ['user', user.text]});
      }

      if (mine)
      {
        selector.push({name: 'eq', args: ['mine', 1]});
      }
    }

  });
});
