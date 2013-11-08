define([
  'app/core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/aors',

    clientUrlRoot: '#aors',

    labelProperty: 'name',

    nlsDomain: 'aors',
    
    defaults: {
      name: null,
      description: null
    }

  });
});
