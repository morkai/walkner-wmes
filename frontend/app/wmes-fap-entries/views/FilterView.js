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
  'app/wmes-fap-entries/templates/filter',
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
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    events: _.assign({

      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent,
      'change input[name="userType"]': function() { this.toggleUserSelect2(true); },
      'change input[name="statusType"]': 'toggleStatus'

    }, FilterView.prototype.events),

    defaultFormData: function()
    {
      return {
        userType: 'others',
        statusType: 'specific'
      };
    },

    termToForm: {
      'createdAt': dateTimeRange.rqlToForm,
      'orderNo': function(propertyName, term, formData)
      {
        formData.order = term.args[1];
      },
      'nc12': 'orderNo',
      'observers.user.id': function(propertyName, term, formData)
      {
        if (term.args[1] === currentUser.data._id)
        {
          formData.userType = 'mine';
          formData.user = currentUser.data._id;
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
      'divisions': 'status',
      'mrp': function(propertyName, term, formData)
      {
        formData.mrp = Array.isArray(term.args[1]) ? term.args[1].join(',') : '';
      },
      'category': 'mrp',
      'analysisNeed': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
        formData.statusType = formData.analysisNeed === undefined || formData.analysisDone === undefined
          ? 'specific'
          : 'analysis';
      },
      'analysisDone': 'analysisNeed'
    },

    serialize: function()
    {
      return _.assign(FilterView.prototype.serialize.call(this), {
        statuses: ['pending', 'started', 'finished'],
        divisions: orgUnits.getAllByType('division')
          .filter(function(d) { return d.isActive() && d.get('type') === 'prod'; })
          .map(idAndLabel)
      });
    },

    serializeFormToQuery: function(selector)
    {
      var userType = this.$('input[name="userType"]:checked').val();
      var statusType = this.$('input[name="statusType"]:checked').val();
      var status = (this.$id('status').val() || []).filter(function(v) { return !_.isEmpty(v); });
      var divisions = (this.$id('divisions').val() || []).filter(function(v) { return !_.isEmpty(v); });
      var user = this.$id('user').val();
      var order = this.$id('order').val().trim();
      var mrp = this.$id('mrp').val();
      var category = this.$id('category').val();

      dateTimeRange.formToRql(this, selector);

      if (userType === 'mine')
      {
        selector.push({name: 'eq', args: ['observers.user.id', currentUser.data._id]});
      }
      else if (userType === 'unseen')
      {
        selector.push({name: 'eq', args: ['observers.user.id', userType]});
      }
      else if (user)
      {
        selector.push({name: 'eq', args: ['observers.user.id', user]});
      }

      if (order.length === 9)
      {
        selector.push({name: 'eq', args: ['orderNo', order]});
      }
      else if (order.length === 7 || order.length === 12)
      {
        selector.push({name: 'eq', args: ['nc12', order]});
      }

      if (statusType === 'specific' && status.length)
      {
        selector.push({name: 'in', args: ['status', status]});
      }
      else if (statusType === 'analysis')
      {
        selector.push(
          {name: 'eq', args: ['analysisNeed', true]},
          {name: 'eq', args: ['analysisDone', false]}
        );
      }

      if (mrp && mrp.length)
      {
        selector.push({name: 'in', args: ['mrp', mrp.split(',')]});
      }

      if (category && category.length)
      {
        selector.push({name: 'in', args: ['category', category.split(',')]});
      }

      if (divisions.length)
      {
        selector.push({name: 'in', args: ['divisions', divisions]});
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.$('.is-expandable').expandableSelect();

      setUpUserSelect2(this.$id('user'), {
        view: this,
        width: '300px'
      });

      setUpMrpSelect2(this.$id('mrp'), {
        own: true,
        view: this,
        width: '250px'
      });

      this.$id('category').select2({
        width: '280px',
        multiple: true,
        allowClear: true,
        data: dictionaries.categories.map(idAndLabel)
      });

      this.toggleUserSelect2(false);
      this.toggleStatus();
    },

    destroy: function()
    {
      FilterView.prototype.destroy.call(this);

      this.$('.is-expandable').expandableSelect('destroy');
    },

    toggleUserSelect2: function(resetUser)
    {
      var userType = this.$('input[name="userType"]:checked').val();
      var $user = this.$id('user').select2('enable', userType === 'others');

      if (resetUser && $user.val() === currentUser.data._id)
      {
        $user.select2('data', null);
      }
    },

    toggleStatus: function()
    {
      var statusType = this.$('input[name="statusType"]:checked').val();

      this.$id('status').prop('disabled', statusType !== 'specific');
    }

  });
});
