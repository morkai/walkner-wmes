define([
  '../core/Collection',
  './DowntimeReason'
], function(
  Collection,
  DowntimeReason
) {
  'use strict';

  return Collection.extend({

    model: DowntimeReason,

    rqlQuery: 'sort(_id)',

    findBySubdivisionType: function(subdivisionType)
    {
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
