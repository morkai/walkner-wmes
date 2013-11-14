define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/aors',

    clientUrlRoot: '#aors',

    topicPrefix: 'aors',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'aors',

    labelAttribute: 'name',
    
    defaults: {
      name: null,
      description: null
    }

  });
});
