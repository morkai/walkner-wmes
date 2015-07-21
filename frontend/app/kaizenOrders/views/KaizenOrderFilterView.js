// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/time',
  'app/core/views/FilterView',
  'app/users/util/setUpUserSelect2',
  '../dictionaries',
  'app/kaizenOrders/templates/filter'
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
        types: [].concat(kaizenDictionaries.types),
        status: [].concat(kaizenDictionaries.statuses),
        section: null,
        area: null,
        category: null,
        risk: null,
        cause: null,
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
      'nearMissCategory': function(propertyName, term, formData)
      {
        formData.category = 'nearMiss.' + term.args[1];
      },
      'suggestionCategory': function(propertyName, term, formData)
      {
        formData.category = 'suggestion.' + term.args[1];
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
      'eventDate': function(propertyName, term, formData)
      {
        formData[term.name === 'ge' ? 'from' : 'to'] = time.format(term.args[1], 'YYYY-MM-DD');
      },
      'status': 'types',
      'section': 'types',
      'area': 'types',
      'risk': 'types',
      'cause': 'types'
    },

    serialize: function()
    {
      return _.extend(FilterView.prototype.serialize.call(this), {
        multi: !!window.KAIZEN_MULTI,
        types: kaizenDictionaries.types,
        statuses: kaizenDictionaries.statuses,
        sections: kaizenDictionaries.sections.toJSON(),
        areas: kaizenDictionaries.areas.toJSON(),
        nearMissCategories: _.invoke(kaizenDictionaries.categories.inNearMiss(), 'toJSON'),
        suggestionCategories: _.invoke(kaizenDictionaries.categories.inSuggestion(), 'toJSON'),
        risks: kaizenDictionaries.risks.toJSON(),
        causes: kaizenDictionaries.causes.toJSON()
      });
    },

    serializeFormToQuery: function(selector)
    {
      var fromMoment = time.getMoment(this.$id('from').val(), 'YYYY-MM-DD');
      var toMoment = time.getMoment(this.$id('to').val(), 'YYYY-MM-DD');
      var category = this.$id('category').val().split('.');
      var userType = this.$('input[name="userType"]:checked').val();
      var user = this.$id('user').val();

      if (fromMoment.isValid())
      {
        selector.push({name: 'ge', args: ['eventDate', fromMoment.valueOf()]});
      }

      if (toMoment.isValid())
      {
        if (toMoment.valueOf() === fromMoment.valueOf())
        {
          this.$id('to').val(toMoment.add(1, 'days').format('YYYY-MM-DD'));
        }

        selector.push({name: 'lt', args: ['eventDate', toMoment.valueOf()]});
      }

      if (category.length === 2)
      {
        selector.push({name: 'eq', args: [category[0] + 'Category', category[1]]});
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

      ['types', 'status', 'section', 'area', 'risk', 'cause'].forEach(function(property)
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
