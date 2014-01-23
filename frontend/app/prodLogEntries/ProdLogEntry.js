define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/prodLogEntries',

    clientUrlRoot: '#prodLogEntries',

    topicPrefix: 'prodLogEntries',

    privilegePrefix: 'PROD_DATA',

    nlsDomain: 'prodLogEntries',

    defaults: {
      type: null
    }

  });

});
