// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  './FteLeaderEntryListView'
], function(
  FteLeaderEntryListView
) {
  'use strict';

  return FteLeaderEntryListView.extend({

    remoteTopics: {
      'fte.master.created': 'refreshCollection',
      'fte.master.deleted': 'onModelDeleted'
    }

  });
});
