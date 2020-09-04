// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FilterView',
  'app/core/util/idAndLabel',
  'app/core/util/forms/dateTimeRange',
  'app/users/util/setUpUserSelect2',
  'app/data/orgUnits',
  '../WhEvent',
  'app/wh-events/templates/filter',
  'app/core/util/ExpandableSelect'
], function(
  _,
  FilterView,
  idAndLabel,
  dateTimeRange,
  setUpUserSelect2,
  orgUnits,
  WhEvent,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    events: _.assign({

      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent

    }, FilterView.prototype.events),

    termToForm: {
      'time': dateTimeRange.rqlToForm,
      'order': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'line': function(propertyName, term, formData)
      {
        formData[propertyName] = Array.isArray(term.args[1]) ? term.args[1].join(',') : term.args[1];
      },
      'set': function(propertyName, term, formData)
      {
        var matches = term.args[1].match(/^([0-9]{4}-[0-9]{2}-[0-9]{2})(?:-([0-9]+))$/);

        if (matches)
        {
          formData.setDate = matches[1];
          formData.setNo = matches[2] || '';
        }
      },
      'user': 'order',
      'type': 'order'
    },

    destroy: function()
    {
      this.$('.is-expandable').expandableSelect('destroy');
    },

    getTemplateData: function()
    {
      return {
        TYPES: WhEvent.TYPES
      };
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.apply(this, arguments);

      setUpUserSelect2(this.$id('user'), {
        width: '275px',
        view: this
      });

      this.$id('line').select2({
        width: '175px',
        allowClear: true,
        data: orgUnits.getActiveByType('prodLine').map(idAndLabel)
      });

      this.$('.is-expandable').expandableSelect();
    },

    serializeFormToQuery: function(selector)
    {
      var user = this.$id('user').val();
      var type = this.$id('type').val();
      var order = this.$id('order').val();
      var line = this.$id('line').val();
      var setDate = this.$id('setDate').val();
      var setNo = parseInt(this.$id('setNo').val(), 10);

      dateTimeRange.formToRql(this, selector);

      if (type && type.length !== WhEvent.TYPES.length)
      {
        selector.push({name: 'in', args: ['type', type]});
      }

      if (user)
      {
        selector.push({name: 'eq', args: ['user', user]});
      }

      if (order)
      {
        selector.push({name: 'eq', args: ['order', order]});
      }

      if (line)
      {
        selector.push({name: 'eq', args: ['line', line]});
      }

      if (setDate)
      {
        if (setNo > 0)
        {
          setDate += '-' + setNo;
        }

        selector.push({name: 'eq', args: ['set', setDate]});
      }
    }

  });
});
