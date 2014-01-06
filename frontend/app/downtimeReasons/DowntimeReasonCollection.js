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

    rqlQuery: 'select(label,pressPosition)&sort(_id)'

  });
});
