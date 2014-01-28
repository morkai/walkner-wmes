define([
  'underscore',
  '../user',
  '../data/prodLines',
  '../core/Collection',
  './ProdLogEntry'
], function(
  _,
  user,
  prodLines,
  Collection,
  ProdLogEntry
) {
  'use strict';

  return Collection.extend({

    model: ProdLogEntry,

    rqlQuery: function(rql)
    {
      return rql.Query.fromObject({
        fields: {

        },
        sort: {
          createdAt: -1
        },
        limit: 20,
        selector: {
          name: 'and',
          args: []
        }
      });
    },

    matches: function(message)
    {
      return this.matchesType(message.types) && this.matchesProdLine(message.prodLine);
    },

    matchesType: function(types)
    {
      var typeTerm = _.find(this.rqlQuery.selector.args, function(term)
      {
        return term.name === 'eq' && term.args[0] === 'type';
      });

      if (!typeTerm)
      {
        return true;
      }

      return !typeTerm ? true : types.indexOf(typeTerm.args[1]) !== -1;
    },

    matchesProdLine: function(prodLineId)
    {
      var prodLineTerm = _.find(this.rqlQuery.selector.args, function(term)
      {
        return term.name === 'eq' && term.args[0] === 'prodLine';
      });

      if (prodLineTerm)
      {
        return prodLineTerm.args[1] === prodLineId;
      }

      if (user.data.super)
      {
        return true;
      }

      var prodLine = prodLines.get(prodLineId);

      if (!prodLine)
      {
        return true;
      }

      var userDivision = user.getDivision();

      if (!userDivision)
      {
        return true;
      }

      var userSubdivision = user.getSubdivision();
      var prodLineSubdivision = prodLine.getSubdivision();

      if (userSubdivision)
      {
        return userSubdivision === prodLineSubdivision;
      }

      return userDivision.id === prodLineSubdivision.get('division');
    }

  });
});
