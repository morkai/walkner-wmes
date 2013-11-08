define([
  'app/core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/downtimeReasons',

    clientUrlRoot: '#downtimeReasons',

    labelProperty: '_id',

    nlsDomain: 'downtimeReasons',
    
    defaults: {
      label: null
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
