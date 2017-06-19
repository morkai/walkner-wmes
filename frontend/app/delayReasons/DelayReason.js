// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/delayReasons',

    clientUrlRoot: '#delayReasons',

    topicPrefix: 'delayReasons',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'delayReasons',

    labelAttribute: 'name',

    defaults: {
      name: null
    }

  });
});
