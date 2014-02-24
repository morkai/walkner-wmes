define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/downtimeReasons',

    clientUrlRoot: '#downtimeReasons',

    topicPrefix: 'downtimeReasons',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'downtimeReasons',

    labelAttribute: 'label',
    
    defaults: function()
    {
      return {
        label: null,
        type: 'other',
        subdivisionTypes: ['assembly', 'press'],
        opticsPosition: -1,
        pressPosition: -1,
        auto: false,
        scheduled: false
      };
    }

  });
});
