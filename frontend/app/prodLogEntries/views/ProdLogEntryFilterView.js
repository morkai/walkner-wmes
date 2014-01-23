define([
  'underscore',
  'moment',
  'js2form',
  'reltime',
  'app/i18n',
  'app/user',
  'app/data/prodLines',
  'app/core/View',
  'app/core/util/fixTimeRange',
  'app/prodLogEntries/templates/filter',
  'select2'
], function(
  _,
  moment,
  js2form,
  reltime,
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
        data: this.getApplicableProdLines(),
        formatSelection: function(orgUnit)
        {
          if (orgUnit.type === 'subdivision')
          {
            return orgUnit.model.get('division') + ' \\ ' + orgUnit.text;
          }

          return orgUnit.text;
        }
      });

      this.$id('type').select2({
        width: '275px',
        allowClear: true
      });
    },

    getApplicableProdLines: function()
    {
      var userDivision = user.getDivision();
      var userSubdivision = user.getSubdivision();

      return prodLines
        .filter(function(prodLine)
        {
          if (user.data.super || !userDivision)
          {
            return true;
          }

          if (userSubdivision)
          {
            return prodLine.get('subdivision') === userSubdivision.id;
          }

          var prodLineSubdivision = prodLine.getSubdivision();

          if (!prodLineSubdivision)
          {
            return true;
          }

          var prodLineDivision = prodLineSubdivision.getDivision();

          if (!prodLineDivision)
          {
            return true;
          }

          return prodLineDivision === userDivision;
        })
        .map(function(prodLine)
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
            formData[term.name === 'ge' ? 'from' : 'to'] =
              moment(term.args[1]).format('YYYY-MM-DD HH:mm:ss');
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
      var timeRange = fixTimeRange(this.$id('from'), this.$id('to'), 'YYYY-MM-DD HH:mm:ss');
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

      if (timeRange.from !== -1)
      {
        selector.push({name: 'ge', args: ['createdAt', timeRange.from]});
      }

      if (timeRange.to !== -1)
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
