define([
  'app/core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/workCenters',

    clientUrlRoot: '#workCenters',

    labelProperty: '_id',

    nlsDomain: 'workCenters',
    
    defaults: {
      description: null
    }

  });
});
