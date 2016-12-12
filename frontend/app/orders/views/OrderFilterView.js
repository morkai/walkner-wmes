// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/util/fixTimeRange',
  'app/core/views/FilterView',
  'app/orders/templates/filter'
], function(
  _,
  fixTimeRange,
  FilterView,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    events: _.extend({}, FilterView.prototype.events, {
      'change #-from': function(e)
      {
        var $to = this.$id('to');

        if ($to.attr('data-changed') !== 'true')
        {
          $to.val(e.target.value);
        }
      },
      'change #-to': function(e)
      {
        e.target.setAttribute('data-changed', 'true');
      }
    }),

    defaultFormData: {
      _id: '',
      nc12: '',
      date: 'finishDate',
      from: '',
      to: '',
      mrp: ''
    },

    termToForm: {
      'startDate': function(propertyName, term, formData)
      {
        formData.date = propertyName;

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
      'nc12': '_id',
      'finishDate': 'startDate'
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
          .filter(function(mrp) { return /^[A-Z0-9]{3}$/.test(mrp); })
          .map(function(mrp) { return {id: mrp, text: mrp}; })
      );
    },

    serializeFormToQuery: function(selector, rqlQuery)
    {
      var timeRange = fixTimeRange.fromView(this);
      var date = this.$('input[name=date]:checked').val();
      var mrp = this.$id('mrp').val();

      this.serializeRegexTerm(selector, '_id', 9, null, false, true);
      this.serializeRegexTerm(selector, 'nc12', 12, null, false, true);

      if (timeRange.from)
      {
        selector.push({name: 'ge', args: [date, timeRange.from]});
      }

      if (timeRange.to)
      {
        selector.push({name: 'le', args: [date, timeRange.to]});
      }

      if (mrp.length)
      {
        selector.push({name: 'in', args: ['mrp', mrp.split(',')]});
      }

      rqlQuery.sort = date === 'finishDate' ? {finishDate: 1} : {startDate: 1};
    }

  });
});
