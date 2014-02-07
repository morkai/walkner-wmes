define([
  'underscore',
  'moment',
  'js2form',
  'app/i18n',
  'app/core/View',
  'app/emptyOrders/templates/filter'
], function(
  _,
  moment,
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

    initialize: function()
    {
      this.idPrefix = _.uniqueId('orderFilter');
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
    },

    serializeRqlQuery: function()
    {
      var rqlQuery = this.model.rqlQuery;
      var formData = {
        dateType: 'start',
        date: '',
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
            formData.date = moment(term.args[1]).format('YYYY-MM-DD');
            break;
        }
      });

      return formData;
    },

    changeFilter: function()
    {
      var rqlQuery = this.model.rqlQuery;
      var selector = [];
      var dateMoment = moment(this.$id('date').val());
      var dateProperty = this.$('[name=dateType]:checked').val() + 'Date';

      if (dateMoment.isValid())
      {
        selector.push({name: 'eq', args: [dateProperty, dateMoment.valueOf()]});
      }

      rqlQuery.selector = {name: 'and', args: selector};
      rqlQuery.limit = parseInt(this.$id('limit').val(), 10) || 15;
      rqlQuery.skip = 0;

      this.trigger('filterChanged', rqlQuery);
    }

  });
});
