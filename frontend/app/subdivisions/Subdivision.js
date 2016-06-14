// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/subdivisions',

    clientUrlRoot: '#subdivisions',

    topicPrefix: 'subdivisions',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'subdivisions',

    labelAttribute: 'name',

    defaults: function()
    {
      return {
        division: null,
        type: 'assembly',
        name: null,
        prodTaskTags: null,
        aor: null,
        autoDowntimes: []
      };
    }

  });
});
