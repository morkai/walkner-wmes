define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/events/types',

    clientUrlRoot: '#events/types',

    nlsDomain: 'events',

    labelAttribute: 'label',

    defaults: {
      label: null,
      value: null
    }

  });
});
