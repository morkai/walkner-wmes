// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/core/views/FilterView',
  'app/users/util/setUpUserSelect2',
  'app/kaizenOrders/dictionaries',
  'app/suggestions/templates/filter',
  'app/core/util/ExpandableSelect'
], function(
  _,
  time,
  FilterView,
  setUpUserSelect2,
  kaizenDictionaries,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    events: _.extend({
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
        from: '',
        to: ''
      };
    },

    termToForm: {
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
      'date': function(propertyName, term, formData)
      {
        formData[term.name === 'ge' ? 'from' : 'to'] = time.format(term.args[1], 'YYYY-MM-DD');
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
      return _.extend(FilterView.prototype.serialize.call(this), {
        statuses: kaizenDictionaries.statuses,
        sections: kaizenDictionaries.sections.toJSON(),
        areas: kaizenDictionaries.areas.toJSON(),
        categories: _.invoke(kaizenDictionaries.categories.inSuggestion(), 'toJSON'),
        productFamilies: kaizenDictionaries.productFamilies.toJSON()
      });
    },

    serializeFormToQuery: function(selector)
    {
      var fromMoment = time.getMoment(this.$id('from').val(), 'YYYY-MM-DD');
      var toMoment = time.getMoment(this.$id('to').val(), 'YYYY-MM-DD');
      var userType = this.$('input[name="userType"]:checked').val();
      var user = this.$id('user').val();

      if (fromMoment.isValid())
      {
        selector.push({name: 'ge', args: ['date', fromMoment.valueOf()]});
      }

      if (toMoment.isValid())
      {
        if (toMoment.valueOf() === fromMoment.valueOf())
        {
          this.$id('to').val(toMoment.add(1, 'days').format('YYYY-MM-DD'));
        }

        selector.push({name: 'lt', args: ['date', toMoment.valueOf()]});
      }

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
