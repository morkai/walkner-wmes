define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/settings',

    clientUrlRoot: '#settings',

    topicPrefix: 'settings',

    privilegePrefix: 'SETTINGS',

    nlsDomain: 'settings',

    defaults: {
      value: null
    }

  });
});
