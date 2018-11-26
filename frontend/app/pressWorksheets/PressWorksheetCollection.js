// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../user',
  '../time',
  '../core/Collection',
  './PressWorksheet'
], function(
  _,
  user,
  time,
  Collection,
  PressWorksheet
) {
  'use strict';

  return Collection.extend({

    model: PressWorksheet,

    rqlQuery: function(rql)
    {
      var selector = [
        {name: 'ge', args: ['date', time.getMoment().startOf('week').subtract(7, 'days').valueOf()]}
      ];
      var userDivision = user.getDivision();

      if (userDivision)
      {
        selector.push({name: 'eq', args: ['divisions', userDivision.id]});
      }

      return rql.Query.fromObject({
        fields: {
          orders: 0,
          operators: 0
        },
        sort: {
          date: -1
        },
        limit: -1337,
        selector: {name: 'and', args: selector}
      });
    },

    sync: function(type, model, options)
    {
      if (type === 'read' && !options.data)
      {
        var userTerm = _.find(this.rqlQuery.selector.args, function(term)
        {
          return term.name === 'eq' && term.args[0] === 'user';
        });

        if (userTerm)
        {
          this.rqlQuery.selector.args = _.without(this.rqlQuery.selector.args, userTerm);
        }

        options.data = this.rqlQuery.toString();

        if (userTerm)
        {
          this.rqlQuery.selector.args.push(userTerm);
        }
      }

      return Collection.prototype.sync.call(this, type, model, options);
    }

  });
});
