// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/d8/entrySources',

    clientUrlRoot: '#d8/entrySources',

    topicPrefix: 'd8.entrySources',

    privilegePrefix: 'D8:DICTIONARIES',

    nlsDomain: 'd8EntrySources',

    labelAttribute: 'name'

  });
});
