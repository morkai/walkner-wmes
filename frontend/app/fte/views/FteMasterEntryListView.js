define([
  './FteLeaderEntryListView',
  'i18n!app/nls/fte'
], function(
  FteLeaderEntryListView
) {
  'use strict';

  return FteLeaderEntryListView.extend({

    remoteTopics: {
      'fte.master.created': 'refreshCollection',
      'fte.master.locked': 'refreshCollection'
    }

  });
});
