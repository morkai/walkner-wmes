// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  './FteLeaderEntry'
], function(
  FteLeaderEntry
) {
  'use strict';

  return FteLeaderEntry.extend({

    TYPE: 'wh',

    urlRoot: '/fte/wh',

    clientUrlRoot: '#fte/wh',

    topicPrefix: 'fte.leader',

    privilegePrefix: 'FTE:WH'

  });
});
