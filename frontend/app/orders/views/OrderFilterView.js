// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/util/fixTimeRange',
  'app/core/views/FilterView',
  'app/users/ownMrps',
  'app/orders/templates/filter'
], function(
  _,
  fixTimeRange,
  FilterView,
  ownMrps,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    events: _.assign({}, ownMrps.events, FilterView.prototype.events),

    defaultFormData: {
      _id: '',
      nc12: '',
      from: '',
      to: '',
      mrp: ''
    },

    termToForm: {
      'scheduledStartDate': function(propertyName, term, formData)
      {
        fixTimeRange.toFormData(formData, term, 'date');
      },
      '_id': function(propertyName, term, formData)
      {
        var value = term.args[1];

        formData[propertyName] = typeof value === 'string' ? value.replace(/[^0-9]/g, '') : '-';
      },
      'mrp': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1].join(',');
      },
      'nc12': '_id'
    },

    serialize: function()
    {
      return _.assign(FilterView.prototype.serialize.apply(this, arguments), {
        showOwnMrps: ownMrps.hasAny()
      });
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      var $mrp = this.$id('mrp').select2({
        width: '300px',
        allowClear: true,
        multiple: true,
        data: [],
        formatNoMatches: null,
        minimumResultsForSearch: 1,
        adaptDropdownCssClass: function() { return 'hidden'; },
        tokenizer: function(input, selection, selectCallback)
        {
          var result = input;
          var options = {};

          selection.forEach(function(item)
          {
            options[item.id] = true;
          });

          (input.match(/[A-Z0-9]{3}/ig) || []).forEach(function(mrp)
          {
            result = result.replace(mrp, '');

            mrp = mrp.toUpperCase();

            if (!options[mrp])
            {
              selectCallback({id: mrp, text: mrp});
              options[mrp] = true;
            }
          });

          return input === result ? null : result.replace(/\s+/, ' ').trim();
        }
      });

      $mrp.select2(
        'data',
        $mrp
          .val()
          .split(',')
          .filter(function(mrp) { return mrp.length; })
          .map(function(mrp) { return {id: mrp, text: mrp}; })
      );
    },

    serializeFormToQuery: function(selector)
    {
      var timeRange = fixTimeRange.fromView(this);
      var mrp = this.$id('mrp').val();

      this.serializeRegexTerm(selector, '_id', 9, null, false, true);
      this.serializeRegexTerm(selector, 'nc12', 12, null, false, true);

      if (timeRange.from)
      {
        selector.push({name: 'ge', args: ['scheduledStartDate', timeRange.from]});
      }

      if (timeRange.to)
      {
        selector.push({name: 'lt', args: ['scheduledStartDate', timeRange.to]});
      }

      if (mrp.length)
      {
        selector.push({name: 'in', args: ['mrp', mrp.split(',')]});
      }
    }

  });
});
