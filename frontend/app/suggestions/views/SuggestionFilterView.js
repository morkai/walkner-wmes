// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/core/views/FilterView',
  'app/core/util/forms/dateTimeRange',
  'app/users/util/setUpUserSelect2',
  'app/kaizenOrders/dictionaries',
  'app/suggestions/templates/filter',
  'app/core/util/ExpandableSelect'
], function(
  _,
  time,
  FilterView,
  dateTimeRange,
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
        status: [],
        section: [],
        categories: [],
        productFamily: [],
        userType: 'others',
        user: null,
        dateType: 'date'
      };
    },

    termToForm: {
      'date': function(property, term, formData)
      {
        formData.dateType = property;

        dateTimeRange.rqlToForm.call(this, property, term, formData);
      },
      'finishedAt': 'date',
      'owners.id': function(propertyName, term, formData)
      {
        formData.userType = 'owner';
        formData.user = term.args[1];
      },
      'observers.user.id': function(propertyName, term, formData)
      {
        if (term.args[1] === 'mine')
        {
          formData.userType = 'mine';
          formData.user = null;
        }
        else if (term.args[1] === 'unseen')
        {
          formData.userType = 'unseen';
          formData.user = null;
        }
        else
        {
          formData.userType = 'others';
          formData.user = term.args[1];
        }
      },
      'status': function(propertyName, term, formData)
      {
        formData[propertyName] = term.name === 'in' ? term.args[1] : [term.args[1]];
      },
      'categories': 'status',
      'section': 'status',
      'area': 'status',
      'productFamily': 'status'
    },

    serialize: function()
    {
      return _.assign(FilterView.prototype.serialize.call(this), {
        statuses: kaizenDictionaries.kzStatuses,
        sections: kaizenDictionaries.sections.toJSON(),
        areas: kaizenDictionaries.areas.toJSON(),
        categories: _.invoke(kaizenDictionaries.categories.inSuggestion(), 'toJSON'),
        productFamilies: kaizenDictionaries.productFamilies.toJSON()
      });
    },

    serializeFormToQuery: function(selector, rqlQuery)
    {
      var dateType = this.$('input[name="dateType"]:checked').val();
      var userType = this.$('input[name="userType"]:checked').val();
      var user = this.$id('user').val();

      rqlQuery.sort = {};
      rqlQuery.sort[dateType] = -1;

      dateTimeRange.formToRql(this, selector);

      selector.forEach(function(term)
      {
        if (term.args[0] === 'date')
        {
          term.args[0] = dateType;
        }
      });

      if (userType === 'mine' || userType === 'unseen')
      {
        selector.push({name: 'eq', args: ['observers.user.id', userType]});
      }
      else if (user)
      {
        selector.push({name: 'eq', args: [
          userType === 'owner' ? 'owners.id' : 'observers.user.id',
          user
        ]});
      }

      ['status', 'categories', 'section', 'area', 'productFamily'].forEach(function(property)
      {
        var values = (this.$id(property).val() || []).filter(function(v) { return !_.isEmpty(v); });

        if (values.length === 1)
        {
          selector.push({name: 'eq', args: [property, values[0]]});
        }
        else if (values.length)
        {
          selector.push({name: 'in', args: [property, values]});
        }
      }, this);
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.$('.is-expandable').expandableSelect();

      setUpUserSelect2(this.$id('user'), {
        view: this
      });

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

      this.$id('user').select2('enable', userType === 'others' || userType === 'owner');
    }

  });
});
