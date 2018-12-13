// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/user',
  'app/core/views/FilterView',
  'app/core/util/forms/dateTimeRange',
  'app/core/util/idAndLabel',
  'app/users/util/setUpUserSelect2',
  'app/mrpControllers/util/setUpMrpSelect2',
  '../dictionaries',
  'app/wmes-fap-entries/templates/filter',
  'app/core/util/ExpandableSelect'
], function(
  _,
  time,
  currentUser,
  FilterView,
  dateTimeRange,
  idAndLabel,
  setUpUserSelect2,
  setUpMrpSelect2,
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
        userType: 'others'
      };
    },

    termToForm: {
      'createdAt': dateTimeRange.rqlToForm,
      'orderNo': function(propertyName, term, formData)
      {
        formData.order = term.args[1];
      },
      'nc12': 'orderNo',
      'observers.id': function(propertyName, term, formData)
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
      'status': function(propertyName, term, formData)
      {
        formData[propertyName] = term.name === 'in' ? term.args[1] : [term.args[1]];
      },
      'mrp': function(propertyName, term, formData)
      {
        formData.mrp = Array.isArray(term.args[1]) ? term.args[1].join(',') : '';
      },
      'category': 'mrp'
    },

    serialize: function()
    {
      return _.assign(FilterView.prototype.serialize.call(this), {
        statuses: ['pending', 'started', 'finished']
      });
    },

    serializeFormToQuery: function(selector)
    {
      var userType = this.$('input[name="userType"]:checked').val();
      var status = (this.$id('status').val() || []).filter(function(v) { return !_.isEmpty(v); });
      var user = this.$id('user').val();
      var order = this.$id('order').val().trim();
      var mrp = this.$id('mrp').val();
      var category = this.$id('category').val();

      dateTimeRange.formToRql(this, selector);

      if (userType === 'mine')
      {
        selector.push({name: 'eq', args: ['observers.id', currentUser.data._id]});
      }
      else if (user)
      {
        selector.push({name: 'eq', args: ['observers.id', user]});
      }

      if (order.length === 9)
      {
        selector.push({name: 'eq', args: ['orderNo', order]});
      }
      else if (order.length === 7 || order.length === 12)
      {
        selector.push({name: 'eq', args: ['nc12', order]});
      }

      if (status.length)
      {
        selector.push({name: 'in', args: ['status', status]});
      }

      if (mrp && mrp.length)
      {
        selector.push({name: 'in', args: ['mrp', mrp.split(',')]});
      }

      if (category && category.length)
      {
        selector.push({name: 'in', args: ['category', category.split(',')]});
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.$('.is-expandable').expandableSelect();

      setUpMrpSelect2(this.$id('mrp'), {own: true, view: this});

      setUpUserSelect2(this.$id('user'), {
        width: '280px',
        view: this
      });

      this.toggleUserSelect2();

      this.$id('category').select2({
        width: '450px',
        multiple: true,
        allowClear: true,
        data: dictionaries.categories.map(idAndLabel)
      });
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
