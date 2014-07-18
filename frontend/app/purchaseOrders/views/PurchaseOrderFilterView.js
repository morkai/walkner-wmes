// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'js2form',
  'app/i18n',
  'app/core/View',
  'app/purchaseOrders/templates/filter'
], function(
  js2form,
  t,
  View,
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
        nc12: '',
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
          case '_id':
            formData._id = typeof term.args[1] === 'string' ? term.args[1].replace(/^[0-9]/g, '') : '';
            break;

          case 'items.nc12':
            formData.nc12 = typeof term.args[1] === 'string' ? term.args[1].replace(/[^0-9]/g, '') : '-';
            break;

          case 'items.schedule.date':

            break;
        }
      });

      return formData;
    },

    changeFilter: function()
    {
      var rqlQuery = this.model.rqlQuery;
      var selector = rqlQuery.selector.args.filter(
        function(term) { return term.name === 'populate'; }
      );

      this.serializeRegexTerm(selector, this.$id('_id'), '_id', 6);
      this.serializeRegexTerm(selector, this.$id('nc12'), 'items.nc12', 12);

      rqlQuery.selector = {name: 'and', args: selector};
      rqlQuery.limit = parseInt(this.$id('limit').val(), 10) || 15;
      rqlQuery.skip = 0;

      this.trigger('filterChanged', rqlQuery);
    },

    serializeRegexTerm: function(selector, $el, property, maxLength)
    {
      var value = $el.val().trim().replace(/[^0-9]/g, '');

      $el.val(value);

      if (value.length === maxLength)
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
