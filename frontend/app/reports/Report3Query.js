// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'h5.rql/index',
  '../time',
  '../core/Model'
], function(
  _,
  rql,
  time,
  Model
) {
  'use strict';

  var COLUMNS = [
    'totalAvailabilityH',
    'operationalAvailabilityH',
    'operationalAvailabilityP',
    'exploitationH',
    'exploitationP',
    'oee',
    'adjustingDuration',
    'maintenanceDuration',
    'renovationDuration',
    'malfunctionDuration',
    'malfunctionCount',
    'majorMalfunctionCount',
    'mttr',
    'mtbf'
  ];

  return Model.extend({

    defaults: function()
    {
      var today = time.getMoment().hours(0).minutes(0).seconds(0).milliseconds(0);

      return {
        to: today.valueOf(),
        from: today.subtract(1, 'days').valueOf(),
        interval: 'day',
        majorMalfunction: 1.5,
        divisions: [],
        subdivisionType: null,
        prodLines: {},
        sort: {
          division: 1,
          _id: 1
        },
        columns: {}
      };
    },

    serializeToObject: function()
    {
      return {
        from: this.get('from'),
        to: this.get('to'),
        interval: this.get('interval'),
        majorMalfunction: this.get('majorMalfunction')
      };
    },

    serializeToString: function()
    {
      var attrs = this.attributes;
      var rqlQuery = new rql.Query();

      rqlQuery.sort = this.get('sort');
      rqlQuery.selector = {
        name: 'and',
        args: [
          {name: 'eq', args: ['from', attrs.from]},
          {name: 'eq', args: ['to', attrs.to]},
          {name: 'eq', args: ['interval', attrs.interval]},
          {name: 'eq', args: ['majorMalfunction', attrs.majorMalfunction]}
        ]
      };

      if (attrs.divisions.length)
      {
        rqlQuery.selector.args.push({
          name: 'in',
          args: ['divisions', attrs.divisions]
        });
      }

      if (attrs.subdivisionType)
      {
        rqlQuery.selector.args.push({
          name: 'eq',
          args: ['subdivisionType', attrs.subdivisionType]
        });
      }

      if (!_.isEmpty(attrs.prodLines))
      {
        rqlQuery.selector.args.push({
          name: 'in',
          args: ['prodLines', Object.keys(attrs.prodLines)]
        });
      }

      var columns = '';

      COLUMNS.forEach(function(column)
      {
        columns += attrs.columns[column] === false ? '0' : '1';
      });

      rqlQuery.selector.args.push({
        name: 'eq',
        args: ['columns', columns]
      });

      return rqlQuery.toString();
    },

    diffProdLines: function(prodLineIds)
    {
      var oldProdLines = this.get('prodLines');
      var newProdLines = {};

      Object.keys(oldProdLines).forEach(function(oldProdLineId)
      {
        if (prodLineIds[oldProdLineId])
        {
          newProdLines[oldProdLineId] = true;
        }
      });

      this.set('prodLines', newProdLines);
    },

    isProdLineSelected: function(prodLineId, emptyIsSelected)
    {
      if (this.attributes.prodLines[prodLineId])
      {
        return true;
      }

      if (emptyIsSelected)
      {
        return _.isEmpty(this.attributes.prodLines);
      }

      return false;
    },

    getSelectedProdLines: function()
    {
      return Object.keys(this.attributes.prodLines);
    },

    toggleProdLineSelection: function(prodLineId, selected)
    {
      if (selected)
      {
        this.attributes.prodLines[prodLineId] = true;
      }
      else
      {
        delete this.attributes.prodLines[prodLineId];
      }

      this.trigger('change');
      this.trigger('change:prodLines');
    },

    matchProdLine: function(prodLine)
    {
      var divisions = this.get('divisions');
      var subdivisionType = this.get('subdivisionType');

      return (!divisions.length || divisions.indexOf(prodLine.division) !== -1)
        && (subdivisionType == null || subdivisionType.indexOf(prodLine.subdivisionType) !== -1);
    },

    changeColumnVisibility: function(column, visible)
    {
      var columns = this.get('columns');

      if (columns[column] === visible)
      {
        return;
      }

      columns[column] = visible;

      this.trigger('change');
      this.trigger('change:columns', column, visible);
    },

    isColumnVisible: function(column)
    {
      return this.get('columns')[column] !== false;
    }

  }, {

    fromRqlQuery: function(rqlQuery)
    {
      var Report3Query = this;
      var attrs = {
        sort: _.isEmpty(rqlQuery.sort) ? undefined : rqlQuery.sort
      };

      (rqlQuery.selector ? rqlQuery.selector.args : []).forEach(function(term)
      {
        if (term.name !== 'eq' && term.name !== 'in')
        {
          return;
        }

        if (term.name === 'in' && term.args[0] === 'prodLines')
        {
          attrs.prodLines = {};

          term.args[1].forEach(function(prodLineId)
          {
            attrs.prodLines[prodLineId] = true;
          });
        }
        else if (term.name === 'eq' && term.args[0] === 'columns')
        {
          attrs.columns = {};

          COLUMNS.forEach(function(column, i)
          {
            if (term.args[1][i] === '0')
            {
              attrs.columns[column] = false;
            }
          });
        }
        else
        {
          attrs[term.args[0]] = term.args[1];
        }
      });

      return new Report3Query(attrs);
    }

  });
});
