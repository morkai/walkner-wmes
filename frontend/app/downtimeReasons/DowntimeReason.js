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
    
    defaults: {
      label: null,
      pressPosition: -1,
      report1: true
    },

    toJSON: function()
    {
      var downtimeReason = Model.prototype.toJSON.call(this);

      if (!downtimeReason.label)
      {
        downtimeReason.label = downtimeReason._id;
      }

      return downtimeReason;
    }

  });
});
