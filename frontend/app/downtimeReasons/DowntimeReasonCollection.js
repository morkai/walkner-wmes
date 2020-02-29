// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../core/Collection',
  './DowntimeReason'
], function(
  _,
  Collection,
  DowntimeReason
) {
  'use strict';

  return Collection.extend({

    model: DowntimeReason,

    rqlQuery: 'sort(_id)',

    comparator: '_id',

    findBySubdivisionType: function(subdivisionType)
    {
      if (Array.isArray(subdivisionType))
      {
        return this.filter(function(downtimeReason)
        {
          return _.some(
            downtimeReason.get('subdivisionTypes'),
            function(actual) { return _.includes(subdivisionType, actual); }
          );
        });
      }

      return this.filter(function(downtimeReason)
      {
        return downtimeReason.get('subdivisionTypes').indexOf(subdivisionType) !== -1;
      });
    },

    findFirstBreakIdBySubdivisionType: function(subdivisionType)
    {
      var breakReason = this.find(function(downtimeReason)
      {
        if (downtimeReason.get('type') !== 'break')
        {
          return false;
        }

        return downtimeReason.get('subdivisionTypes').indexOf(subdivisionType) !== -1;
      });

      return breakReason ? breakReason.id : null;
    }

  });
});
