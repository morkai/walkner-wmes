// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../core/Collection',
  './PlanChange'
], function(
  _,
  time,
  Collection,
  PlanChange
) {
  'use strict';

  return Collection.extend({

    model: PlanChange,

    rqlQuery: 'sort(date)',

    getDate: function(format)
    {
      var term = _.find(
        this.rqlQuery.selector.args,
        function(term) { return term.name === 'eq' && term.args[0] === 'plan'; }
      );

      return term ? time.utc.format(term.args[1], format || 'YYYY-MM-DD') : null;
    }

  });
});
