// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
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
  $,
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
      'limit'
    ],
    filterMap: {
      family: 'mrps'
    },

    template: template,

    events: _.assign({

      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent,
      'change input[name="userType"]': 'toggleUserSelect2',

      'focus #-orderNo': function(e)
      {
        var $input = this.$(e.currentTarget);
        var $group = $input.closest('.form-group');
        var $textarea = $('<textarea class="form-control text-mono" rows="4"></textarea>')
          .css({
            position: 'absolute',
            marginTop: '-34px',
            width: '410px',
            zIndex: '3'
          })
          .val($input.val())
          .appendTo($group)
          .focus();

        $textarea.on('blur', function()
        {
          $input.val($textarea.val().split('\n').join(' ')).prop('disabled', false);
          $textarea.remove();
        });

        $input[0].disabled = true;
      }

    }, FilterView.prototype.events),

    defaultFormData: function()
    {
      return {
        userType: 'others',
        invalid: false
      };
    },

    termToForm: {
      'createdAt': dateTimeRange.rqlToForm,
      'orders.orderNo': function(propertyName, term, formData)
      {
        formData.orderNo = term.name === 'in' ? term.args[1].join(' ') : term.args[1];
      },
      'oldComponents._id': function(propertyName, term, formData)
      {
        formData.oldComponent = term.args[1];
      },
      'newComponents._id': function(propertyName, term, formData)
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
      },
      'valid': function(propertyName, term, formData)
      {
        formData.invalid = term.args[1] === false;
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
      var orderNo = _.uniq(this.$id('orderNo').val().trim().split(/[^0-9]+/).filter(v => /^[0-9]{9}$/.test(v)));
      var oldComponent = this.$id('oldComponent').val().trim();
      var newComponent = this.$id('newComponent').val().trim();
      var mrps = this.$id('mrps').val();
      var invalid = this.$('input[name="invalid"]:checked').val();

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

      if (orderNo.length)
      {
        selector.push({name: 'in', args: ['orders.orderNo', orderNo]});
      }

      if (oldComponent.length)
      {
        selector.push({name: 'eq', args: ['oldComponents._id', oldComponent]});
      }

      if (newComponent.length)
      {
        selector.push({name: 'eq', args: ['newComponents._id', newComponent]});
      }

      if (invalid)
      {
        selector.push({name: 'eq', args: ['valid', false]});
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

      this.toggleButtonGroup('invalid');
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
        this.$id('user').select2('focus');

        return;
      }

      return FilterView.prototype.showFilter.apply(this, arguments);
    }

  });
});
