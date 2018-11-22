// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/user',
  'app/core/views/FilterView',
  'app/core/util/forms/dateTimeRange',
  'app/users/util/setUpUserSelect2',
  'app/wmes-toolcal-tools/dictionaries',
  'app/wmes-toolcal-tools/templates/filter',
  'app/core/util/ExpandableSelect'
], function(
  _,
  time,
  currentUser,
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
      'change input[name="userType"]': 'toggleUserSelect2'

    }, FilterView.prototype.events),

    defaultFormData: function()
    {
      return {
        dateType: 'next',
        userType: 'others'
      };
    },

    termToForm: {
      'lastDate': function(property, term, formData)
      {
        formData.dateType = property;

        dateTimeRange.rqlToForm.call(this, property, term, formData);
      },
      'nextDate': 'lastDate',
      'status': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'users.id': function(propertyName, term, formData)
      {
        if (term.args[1] === currentUser.data._id)
        {
          formData.userType = 'mine';
          formData.user = currentUser.data._id;
        }
        else
        {
          formData.userType = 'others';
          formData.user = term.args[1];
        }
      },
      'name': function(propertyName, term, formData)
      {
        formData[propertyName] = this.unescapeRegExp(term.args[1]);
      },
      'sn': 'name',
      'type': function(propertyName, term, formData)
      {
        formData[propertyName] = term.name === 'in' ? term.args[1] : [term.args[1]];
      }
    },

    serialize: function()
    {
      return _.assign(FilterView.prototype.serialize.call(this), {
        statuses: dictionaries.statuses,
        types: dictionaries.types.toJSON()
      });
    },

    serializeFormToQuery: function(selector)
    {
      var dateType = this.$('input[name="dateType"]:checked').val();
      var userType = this.$('input[name="userType"]:checked').val();
      var status = this.$id('status').val();
      var type = (this.$id('type').val() || []).filter(function(v) { return !_.isEmpty(v); });
      var user = this.$id('user').val();

      dateTimeRange.formToRql(this, selector);

      selector.forEach(function(term)
      {
        if (term.args[0] === 'date')
        {
          term.args[0] = dateType;
        }
      });

      if (userType === 'mine')
      {
        selector.push({name: 'eq', args: ['users.id', currentUser.data._id]});
      }
      else if (user)
      {
        selector.push({name: 'eq', args: ['users.id', user]});
      }

      this.serializeRegexTerm(selector, 'name', 100, null, true, false);
      this.serializeRegexTerm(selector, 'sn', 100, null, true, false);

      if (status.length)
      {
        selector.push({name: 'eq', args: ['status', status]});
      }

      if (type.length)
      {
        selector.push({name: 'in', args: ['type', type]});
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.$('.is-expandable').expandableSelect();

      setUpUserSelect2(this.$id('user'), {
        width: '280px',
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

      this.$id('user').select2('enable', userType === 'others');
    }

  });
});
