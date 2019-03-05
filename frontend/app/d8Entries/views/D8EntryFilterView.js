// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/core/views/FilterView',
  'app/core/util/forms/dateTimeRange',
  'app/users/util/setUpUserSelect2',
  'app/d8Entries/dictionaries',
  'app/d8Entries/templates/filter'
], function(
  _,
  time,
  FilterView,
  dateTimeRange,
  setUpUserSelect2,
  dictionaries,
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
        status: [].concat(dictionaries.statuses),
        area: null,
        entrySource: null,
        problemSource: null,
        userType: 'others',
        user: null
      };
    },

    termToForm: {
      'crsRegisterDate': dateTimeRange.rqlToForm,
      'area': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'owner.id': function(propertyName, term, formData)
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
      'status': 'area',
      'entrySource': 'area',
      'problemSource': 'area'
    },

    serialize: function()
    {
      return _.assign(FilterView.prototype.serialize.call(this), {
        statuses: dictionaries.statuses,
        areas: dictionaries.areas.toJSON(),
        entrySources: dictionaries.entrySources.toJSON(),
        problemSources: dictionaries.problemSources.toJSON()
      });
    },

    serializeFormToQuery: function(selector)
    {
      var userType = this.$('input[name="userType"]:checked').val();
      var user = this.$id('user').val();

      dateTimeRange.formToRql(this, selector);

      if (userType === 'mine' || userType === 'unseen')
      {
        selector.push({name: 'eq', args: ['observers.user.id', userType]});
      }
      else if (user)
      {
        selector.push({name: 'eq', args: [
          userType === 'owner' ? 'owner.id' : 'observers.user.id',
          user
        ]});
      }

      ['entrySource', 'problemSource', 'area', 'status'].forEach(function(property)
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
