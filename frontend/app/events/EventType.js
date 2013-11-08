define([
  'app/core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/events/types',

    clientUrlRoot: '#events/types',

    labelProperty: 'label',

    nlsDomain: 'events',

    defaults: {
      label: '',
      value: ''
    }

  });
});
