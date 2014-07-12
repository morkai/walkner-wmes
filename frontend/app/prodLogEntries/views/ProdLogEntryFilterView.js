// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'js2form',
  'app/i18n',
  'app/user',
  'app/data/prodLines',
  'app/core/View',
  'app/core/util/fixTimeRange',
  'app/prodLogEntries/templates/filter',
  'select2'
], function(
  _,
  js2form,
  t,
  user,
  prodLines,
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
      }
    },

    initialize: function()
    {
      this.idPrefix = _.uniqueId('prodLogEntryFilter');
    },

    destroy: function()
    {
      this.$('.select2-offscreen[tabindex="-1"]').select2('destroy');
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix
      };
    },

    afterRender: function()
    {
      var formData = this.serializeRqlQuery();

      js2form(this.el.querySelector('.filter-form'), formData);

      this.$id('prodLine').select2({
        width: '275px',
        allowClear: !user.getDivision(),
        data: this.getApplicableProdLines()
      });

      this.$id('type').select2({
        width: '275px',
        allowClear: true
      });
    },

    getApplicableProdLines: function()
    {
      return prodLines.getForCurrentUser().map(function(prodLine)
      {
        return {
          id: prodLine.id,
          text: prodLine.getLabel()
        };
      });
    },

    serializeRqlQuery: function()
    {
      var rqlQuery = this.model.rqlQuery;
      var formData = {
        createdAt: '',
        prodLine: null,
        type: null,
        limit: rqlQuery.limit < 5 ? 5 : (rqlQuery.limit > 100 ? 100 : rqlQuery.limit)
      };

      rqlQuery.selector.args.forEach(function(term)
      {
        /*jshint -W015*/

        var property = term.args[0];

        switch (property)
        {
          case 'createdAt':
            fixTimeRange.toFormData(formData, term, 'date+time');
            break;

          case 'prodLine':
          case 'type':
            if (term.name === 'eq')
            {
              formData[property] = term.args[1];
            }
            break;
        }
      });

      return formData;
    },

    changeFilter: function()
    {
      var rqlQuery = this.model.rqlQuery;
      var timeRange = fixTimeRange.fromView(this, {defaultTime: '06:00'});
      var selector = [];
      var prodLine = this.$id('prodLine').val();
      var type = this.$id('type').val();

      if (prodLine && prodLine.length)
      {
        selector.push({name: 'eq', args: ['prodLine', prodLine]});
      }

      if (type && type.length)
      {
        selector.push({name: 'eq', args: ['type', type]});
      }

      if (timeRange.from)
      {
        selector.push({name: 'ge', args: ['createdAt', timeRange.from]});
      }

      if (timeRange.to)
      {
        selector.push({name: 'le', args: ['createdAt', timeRange.to]});
      }

      rqlQuery.selector = {name: 'and', args: selector};
      rqlQuery.limit = parseInt(this.$id('limit').val(), 10) || 15;
      rqlQuery.skip = 0;

      this.trigger('filterChanged', rqlQuery);
    }

  });
});
