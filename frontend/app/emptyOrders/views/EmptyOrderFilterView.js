// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'js2form',
  'app/i18n',
  'app/core/View',
  'app/core/util/fixTimeRange',
  'app/emptyOrders/templates/filter'
], function(
  js2form,
  t,
  View,
  fixTimeRange,
  filterTemplate
) {
  'use strict';

  return View.extend({

    template: filterTemplate,

    events: {
      'submit .filter-form': function(e)
      {
        e.preventDefault();

        this.changeFilter();
      },
      'change #-from': function(e)
      {
        var $to = this.$('input[name=to]');

        if ($to.attr('data-changed') !== 'true')
        {
          $to.val(e.target.value);
        }
      },
      'change #-to': function(e)
      {
        e.target.setAttribute('data-changed', 'true');
      }
    },

    afterRender: function()
    {
      var formData = this.serializeRqlQuery();

      js2form(this.el.querySelector('.filter-form'), formData);
    },

    serializeRqlQuery: function()
    {
      var rqlQuery = this.model.rqlQuery;
      var formData = {
        _id: '',
        date: 'startDate',
        from: '',
        to: '',
        limit: rqlQuery.limit < 5 ? 5 : (rqlQuery.limit > 100 ? 100 : rqlQuery.limit)
      };

      rqlQuery.selector.args.forEach(function(term)
      {
        /*jshint -W015*/

        var property = term.args[0];

        switch (property)
        {
          case 'startDate':
          case 'finishDate':
            formData.date = property;

            fixTimeRange.toFormData(formData, term, 'date');
            break;

          case '_id':
            var value = term.args[1];

            formData[property] = typeof value === 'string' ? value.replace(/[^0-9]/g, '') : '-';
            break;
        }
      });

      return formData;
    },

    changeFilter: function()
    {
      var rqlQuery = this.model.rqlQuery;
      var timeRange = fixTimeRange.fromView(this);
      var selector = [];
      var date = this.$('[name=date]:checked').val();

      this.serializeRegexTerm(selector, '_id', 9);

      if (timeRange.from)
      {
        selector.push({name: 'ge', args: [date, timeRange.from]});
      }

      if (timeRange.to)
      {
        selector.push({name: 'le', args: [date, timeRange.to]});
      }

      rqlQuery.selector = {name: 'and', args: selector};
      rqlQuery.limit = parseInt(this.$id('limit').val(), 10) || 15;
      rqlQuery.skip = 0;

      this.trigger('filterChanged', rqlQuery);
    },

    serializeRegexTerm: function(selector, property, maxLength)
    {
      var $el = this.$id(property);
      var value = $el.val().trim();

      if (value !== '-')
      {
        value = value.replace(/[^0-9]/g, '');
      }

      $el.val(value);

      if (value === '-')
      {
        value = null;
      }

      if (value === null || value.length === maxLength)
      {
        selector.push({name: 'eq', args: [property, value]});
      }
      else if (value.length > 0)
      {
        selector.push({name: 'regex', args: [property, value]});
      }
    }

  });
});
