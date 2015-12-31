// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/vendors',

    clientUrlRoot: '#vendors',

    topicPrefix: 'vendors',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'vendors',

    labelAttribute: '_id',

    defaults: {
      name: null
    }

  });
});
