// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/core/views/FilterView',
  'app/users/util/setUpUserSelect2',
  '../dictionaries',
  'app/kaizenOrders/templates/filter'
], function(
  _,
  FilterView,
  setUpUserSelect2,
  kaizenDictionaries,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    events: _.extend({

      'change input[name="userType"]': 'toggleUserSelect2'

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
        user: null
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
      'status': 'types',
      'section': 'types',
      'area': 'types',
      'risk': 'types',
      'cause': 'types'
    },

    serialize: function()
    {
      return _.extend(FilterView.prototype.serialize.call(this), {
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
      var category = this.$id('category').val().split('.');
      var userType = this.$('input[name="userType"]:checked').val();
      var user = this.$id('user').val();

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
        selector.push({name: 'eq', args: ['observers.user.id', user]});
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
      this.$id('user').select2('enable', this.$('input[name="userType"]:checked').val() === 'others');
    }

  });
});
