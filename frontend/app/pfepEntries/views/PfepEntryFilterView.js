// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/core/views/FilterView',
  'app/core/util/idAndLabel',
  'app/core/util/forms/dateTimeRange',
  'app/users/util/setUpUserSelect2',
  'app/pfepEntries/templates/filter'
], function(
  _,
  time,
  FilterView,
  idAndLabel,
  dateTimeRange,
  setUpUserSelect2,
  template
) {
  'use strict';

  return FilterView.extend({

    filterList: [
      'nc12',
      'packType',
      'vendor',
      'creator',
      'limit'
    ],
    filterMap: {},

    template: template,

    events: _.assign({

      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent,

      'mouseup #-result > .btn': function(e)
      {
        var labelEl = e.currentTarget;
        var radioEl = labelEl.firstElementChild;

        if (radioEl.checked)
        {
          setTimeout(function()
          {
            labelEl.classList.remove('active');
            radioEl.checked = false;
          }, 1);
        }
      }

    }, FilterView.prototype.events),

    defaultFormData: function()
    {
      return {
        nc12: '',
        packType: '',
        vendor: '',
        creator: ''
      };
    },

    termToForm: {
      'createdAt': dateTimeRange.rqlToForm,
      'nc12': function(propertyName, term, formData)
      {
        formData.nc12 = term.args[1].replace(/[^A-Z0-9]+/g, '');
      },
      'packType': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'creator.id': function(propertyName, term, formData)
      {
        formData[propertyName.split('.')[0]] = term.name === 'in' ? term.args[1].join(',') : term.args[1];
      }
    },

    serializeFormToQuery: function(selector)
    {
      var nc12 = this.$id('nc12').val().replace(/[^0-9A-Za-z]+/g, '').toUpperCase();
      var creator = this.$id('creator').val();

      dateTimeRange.formToRql(this, selector);

      if (/^([0-9]{12}|[A-Z][A-Z0-9]{6})$/.test(nc12))
      {
        selector.push({name: 'eq', args: ['nc12', nc12]});
      }
      else if (nc12.length)
      {
        selector.push({name: 'regex', args: ['nc12', '^' + nc12]});
      }

      if (creator.length)
      {
        if (creator.indexOf(',') === -1)
        {
          selector.push({name: 'eq', args: ['creator.id', creator]});
        }
        else
        {
          selector.push({name: 'in', args: ['creator.id', creator.split(',')]});
        }
      }

      ['packType', 'vendor'].forEach(function(property)
      {
        var value = this.$id(property).val().trim();

        if (value)
        {
          selector.push({name: 'eq', args: [property, value]});
        }
      }, this);
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.$id('limit').parent().attr('data-filter', 'limit');

      this.$id('filters').select2({
        width: '175px'
      });

      setUpUserSelect2(this.$id('creator'), {
        view: this,
        width: '275px'
      });
    },

    showFilter: function(filter)
    {
      if (filter === 'date')
      {
        this.$id('from-date').focus();

        return;
      }

      FilterView.prototype.showFilter.apply(this, arguments);
    }

  });
});
