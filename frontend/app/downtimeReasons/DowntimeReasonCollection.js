// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
      return 'A';

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
