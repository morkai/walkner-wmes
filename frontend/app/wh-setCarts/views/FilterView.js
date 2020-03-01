// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FilterView',
  'app/core/util/idAndLabel',
  'app/core/util/forms/dateTimeRange',
  'app/users/util/setUpUserSelect2',
  '../WhSetCart',
  'app/wh-setCarts/templates/filter',
  'app/core/util/ExpandableSelect'
], function(
  _,
  FilterView,
  idAndLabel,
  dateTimeRange,
  setUpUserSelect2,
  WhSetCart,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    events: _.assign({

      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent

    }, FilterView.prototype.events),

    termToForm: {
      'date': dateTimeRange.rqlToForm,
      'orders.sapOrder': function(propertyName, term, formData)
      {
        formData.order = term.args[1];
      },
      'status': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'kind': 'status',
      'users': 'status'
    },

    destroy: function()
    {
      this.$('.is-expandable').expandableSelect('destroy');
    },

    getTemplateData: function()
    {
      return {
        STATUSES: WhSetCart.STATUSES,
        KINDS: WhSetCart.KINDS
      };
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.apply(this, arguments);

      setUpUserSelect2(this.$id('users'), {
        width: '275px',
        view: this
      });

      this.$('.is-expandable').expandableSelect();
    },

    serializeFormToQuery: function(selector)
    {
      var users = this.$id('users').val();
      var status = this.$id('status').val();
      var kind = this.$id('kind').val();
      var order = this.$id('order').val();

      dateTimeRange.formToRql(this, selector);

      if (users)
      {
        selector.push({name: 'eq', args: ['users', users]});
      }

      if (status && status.length !== WhSetCart.STATUSES.length)
      {
        selector.push({name: 'in', args: ['status', status]});
      }

      if (kind)
      {
        selector.push({name: 'eq', args: ['kind', kind]});
      }

      if (/^[0-9]{9}$/.test(order))
      {
        selector.push({name: 'eq', args: ['orders.sapOrder', order]});
      }
    }

  });
});
