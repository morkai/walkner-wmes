// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/factoryLayout',

    clientUrlRoot: '#factoryLayout',

    topicPrefix: 'factoryLayout',

    privilegePrefix: 'FACTORY_LAYOUT',

    nlsDomain: 'factoryLayout',

    defaults: {
      live: null,
      draft: null
    }

  });
});
