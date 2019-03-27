// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/user',
  'app/core/views/FilterView',
  'app/core/util/idAndLabel',
  'app/core/util/forms/dateTimeRange',
  'app/data/orgUnits',
  'app/users/util/setUpUserSelect2',
  'app/kaizenOrders/dictionaries',
  'app/behaviorObsCards/templates/filter',
  'app/core/util/ExpandableSelect'
], function(
  _,
  time,
  currentUser,
  FilterView,
  idAndLabel,
  dateTimeRange,
  orgUnits,
  setUpUserSelect2,
  kaizenDictionaries,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    events: _.assign({

      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent,
      'change input[name="userType"]': 'toggleUserSelect2',
      'keyup select': function(e)
      {
        if (e.keyCode === 27)
        {
          e.target.selectedIndex = -1;

          return false;
        }
      },
      'dblclick select': function(e)
      {
        e.target.selectedIndex = -1;
      }

    }, FilterView.prototype.events),

    defaultFormData: function()
    {
      return {
        section: [],
        observerSection: [],
        line: [],
        userType: 'others',
        user: null,
        anyHard: []
      };
    },

    termToForm: {
      'date': dateTimeRange.rqlToForm,
      'observer.id': function(propertyName, term, formData)
      {
        formData.userType = 'observer';
        formData.user = term.args[1];
      },
      'superior.id': function(propertyName, term, formData)
      {
        formData.userType = 'superior';
        formData.user = term.args[1];
      },
      'users': function(propertyName, term, formData)
      {
        if (term.args[1] === 'mine')
        {
          formData.userType = 'mine';
          formData.user = null;
        }
        else
        {
          formData.userType = 'others';
          formData.user = term.args[1];
        }
      },
      'section': function(propertyName, term, formData)
      {
        formData[propertyName] = term.name === 'in' ? term.args[1] : [term.args[1]];
      },
      'observerSection': 'section',
      'line': function(propertyName, term, formData)
      {
        formData[propertyName] = term.name === 'in' ? term.args[1].join(',') : term.args[1];
      },
      'anyHardObservations': function(propertyName, term, formData)
      {
        if (term.args[1])
        {
          formData.anyHard.push('observations');
        }
      },
      'anyHardRisks': function(propertyName, term, formData)
      {
        if (term.args[1])
        {
          formData.anyHard.push('risks');
        }
      }
    },

    serialize: function()
    {
      return _.assign(FilterView.prototype.serialize.call(this), {
        sections: kaizenDictionaries.sections.toJSON()
      });
    },

    serializeFormToQuery: function(selector)
    {
      var userType = this.$('input[name="userType"]:checked').val();
      var user = this.$id('user').val();
      var anyHard = this.getButtonGroupValue('anyHard');

      dateTimeRange.formToRql(this, selector);

      if (userType === 'observer' && user)
      {
        selector.push({name: 'eq', args: ['observer.id', user]});
      }
      else if (userType === 'superior' && user)
      {
        selector.push({name: 'eq', args: ['superior.id', user]});
      }
      else if (userType === 'mine')
      {
        selector.push({name: 'eq', args: ['users', 'mine']});
      }
      else if (user)
      {
        selector.push({name: 'eq', args: ['users', user]});
      }

      if (_.contains(anyHard, 'observations'))
      {
        selector.push({name: 'eq', args: ['anyHardObservations', true]});
      }

      if (_.contains(anyHard, 'risks'))
      {
        selector.push({name: 'eq', args: ['anyHardRisks', true]});
      }

      ['observerSection', 'section', 'line'].forEach(function(property)
      {
        var values = this.$id(property).val() || [];

        if (typeof values === 'string')
        {
          values = values.split(',');
        }

        values = values.filter(function(v) { return !_.isEmpty(v); });

        if (values.length === 1)
        {
          selector.push({name: 'eq', args: [property, values[0]]});
        }
        else if (values.length)
        {
          selector.push({name: 'in', args: [property, values]});
        }
      }, this);

      selector.push({name: 'lang', args: [currentUser.lang]});
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.$('.is-expandable').expandableSelect();

      setUpUserSelect2(this.$id('user'), {
        width: '335px',
        view: this
      });

      this.$id('line').select2({
        width: '250px',
        allowClear: true,
        multiple: true,
        placeholder: ' ',
        data: orgUnits.getActiveByType('prodLine').map(idAndLabel)
      });

      this.toggleButtonGroup('anyHard');
      this.toggleUserSelect2();
    },

    destroy: function()
    {
      FilterView.prototype.destroy.call(this);

      this.$('.is-expandable').expandableSelect('destroy');
    },

    toggleUserSelect2: function()
    {
      var userType = this.$('input[name="userType"]:checked').val();

      this.$id('user').select2('enable', userType !== 'mine');
    }

  });
});
