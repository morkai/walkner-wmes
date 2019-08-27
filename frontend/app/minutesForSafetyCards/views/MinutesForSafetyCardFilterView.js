// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/core/views/FilterView',
  'app/core/util/forms/dateTimeRange',
  'app/users/util/setUpUserSelect2',
  'app/kaizenOrders/dictionaries',
  'app/minutesForSafetyCards/templates/filter',
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
        section: [],
        userType: 'others',
        user: null
      };
    },

    termToForm: {
      'date': dateTimeRange.rqlToForm,
      'owner.id': function(propertyName, term, formData)
      {
        formData.userType = 'owner';
        formData.user = term.args[1];
      },
      'confirmer.id': function(propertyName, term, formData)
      {
        formData.userType = 'confirmer';
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
      }
    },

    getTemplateData: function()
    {
      return {
        sections: kaizenDictionaries.sections.toJSON()
      };
    },

    serializeFormToQuery: function(selector)
    {
      var userType = this.$('input[name="userType"]:checked').val();
      var user = this.$id('user').val();

      dateTimeRange.formToRql(this, selector);

      if (userType === 'owner' || userType === 'confirmer')
      {
        selector.push({name: 'eq', args: [userType + '.id', user]});
      }
      else if (userType === 'mine')
      {
        selector.push({name: 'eq', args: ['users', 'mine']});
      }
      else if (user)
      {
        selector.push({name: 'eq', args: ['users', user]});
      }

      ['section'].forEach(function(property)
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
        width: '100%',
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

      this.$id('user').select2('enable', userType !== 'mine');
    }

  });
});
