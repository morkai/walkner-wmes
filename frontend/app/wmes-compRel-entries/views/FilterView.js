// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/user',
  'app/core/views/FilterView',
  'app/core/util/forms/dateTimeRange',
  'app/core/util/idAndLabel',
  'app/data/orgUnits',
  'app/users/util/setUpUserSelect2',
  'app/mrpControllers/util/setUpMrpSelect2',
  '../dictionaries',
  '../Entry',
  'app/wmes-compRel-entries/templates/filter',
  'app/core/util/ExpandableSelect'
], function(
  _,
  time,
  currentUser,
  FilterView,
  dateTimeRange,
  idAndLabel,
  orgUnits,
  setUpUserSelect2,
  setUpMrpSelect2,
  dictionaries,
  Entry,
  template
) {
  'use strict';

  return FilterView.extend({

    filterList: [
      'createdAt',
      'mrps',
      'oldComponent',
      'newComponent',
      'orderNo',
      'limit'
    ],
    filterMap: {
      family: 'mrps'
    },

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
      'orders.orderNo': function(propertyName, term, formData)
      {
        formData.orderNo = term.args[1];
      },
      'oldComponents._id': function(propertyName, term, formData)
      {
        formData.oldComponent = term.args[1];
      },
      'newCode': function(propertyName, term, formData)
      {
        formData.newComponent = term.args[1];
      },
      'creator.id': function(propertyName, term, formData)
      {
        formData.userType = 'creator';
        formData.user = term.args[1];
      },
      'funcs.acceptedBy.id': function(propertyName, term, formData)
      {
        formData.userType = 'acceptor';
        formData.user = term.args[1];
      },
      'users': function(propertyName, term, formData)
      {
        if (term.args[1] === 'mine')
        {
          formData.userType = 'mine';
          formData.user = currentUser.data._id;
        }
        else
        {
          formData.userType = term.args[1] === currentUser.data._id ? 'mine' : 'others';
          formData.user = term.args[1];
        }
      },
      'status': function(propertyName, term, formData)
      {
        formData[propertyName] = term.name === 'in' ? term.args[1] : [term.args[1]];
      },
      'mrps': function(propertyName, term, formData)
      {
        formData.mrp = Array.isArray(term.args[1]) ? term.args[1].join(',') : '';
      }
    },

    getTemplateData: function()
    {
      return {
        statuses: dictionaries.statuses
      };
    },

    serializeFormToQuery: function(selector)
    {
      var userType = this.$('input[name="userType"]:checked').val();
      var status = (this.$id('status').val() || []).filter(function(v) { return !_.isEmpty(v); });
      var user = this.$id('user').val();
      var orderNo = this.$id('orderNo').val().trim();
      var oldComponent = this.$id('oldComponent').val().trim();
      var newComponent = this.$id('newComponent').val().trim();
      var mrps = this.$id('mrps').val();

      dateTimeRange.formToRql(this, selector);

      if (userType === 'mine')
      {
        userType = 'others';
        user = currentUser.data._id;
      }

      if (user)
      {
        var userProp = 'users';

        if (userType === 'creator')
        {
          userProp = 'creator.id';
        }
        else if (userType === 'acceptor')
        {
          userProp = 'funcs.acceptedBy.id';
        }

        selector.push({name: 'eq', args: [userProp, user]});
      }

      if (status.length)
      {
        selector.push({name: 'in', args: ['status', status]});
      }

      if (mrps && mrps.length)
      {
        selector.push({name: 'in', args: ['mrps', mrps.split(',')]});
      }

      if (orderNo.length === 9)
      {
        selector.push({name: 'eq', args: ['orders.orderNo', orderNo]});
      }

      if (oldComponent.length)
      {
        selector.push({name: 'eq', args: ['oldComponents._id', oldComponent]});
      }

      if (newComponent.length)
      {
        selector.push({name: 'eq', args: ['newCode', newComponent]});
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.$id('limit').parent().attr('data-filter', 'limit');

      this.$('.is-expandable').expandableSelect();

      setUpUserSelect2(this.$id('user'), {
        view: this,
        width: '100%'
      });

      setUpMrpSelect2(this.$id('mrps'), {
        own: true,
        view: this,
        width: '250px'
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
      this.$id('user').select2('enable', this.$('input[name="userType"]:checked').val() !== 'mine');
    },

    filterHasValue: function(filter)
    {
      if (filter === 'createdAt')
      {
        var $from = this.$id('from-date');
        var $to = this.$id('to-date');

        return $from.val().length > 0 || $to.val().length > 0;
      }

      return FilterView.prototype.filterHasValue.apply(this, arguments);
    },

    showFilter: function(filter)
    {
      if (filter === 'creator')
      {
        this.$('input[value="creator"]').parent().click();

        return;
      }

      return FilterView.prototype.showFilter.apply(this, arguments);
    }

  });
});
