// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/core/views/FilterView',
  'app/users/util/setUpUserSelect2',
  'app/kaizenOrders/dictionaries',
  'app/suggestions/templates/filter'
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
        status: [].concat(kaizenDictionaries.statuses),
        section: null,
        category: null,
        productFamily: null,
        userType: 'others',
        user: null,
        from: '',
        to: ''
      };
    },

    termToForm: {
      'types': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'categories': function(propertyName, term, formData)
      {
        formData.category = term.args[1];
      },
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
        formData.status = term.name === 'in' ? 'open' : term.args[1];
      },
      'section': 'types',
      'area': 'types',
      'productFamily': 'types'
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
      var category = this.$id('category').val();
      var userType = this.$('input[name="userType"]:checked').val();
      var user = this.$id('user').val();
      var status = this.$id('status').val();

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

      if (category)
      {
        selector.push({name: 'eq', args: ['categories', category]});
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

      if (status === 'open')
      {
        selector.push({name: 'in', args: ['status', ['new', 'accepted', 'todo', 'inProgress', 'paused']]});
      }
      else if (status)
      {
        selector.push({name: 'eq', args: ['status', status]});
      }

      ['section', 'area', 'productFamily'].forEach(function(property)
      {
        var value = this.$id(property).val();

        if (value)
        {
          selector.push({name: 'eq', args: [property, value]});
        }
      }, this);
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      setUpUserSelect2(this.$id('user'), {
        view: this
      });

      this.toggleUserSelect2();
    },

    toggleUserSelect2: function()
    {
      var userType = this.$('input[name="userType"]:checked').val();

      this.$id('user').select2('enable', userType === 'others' || userType === 'owner');
    }

  });
});
