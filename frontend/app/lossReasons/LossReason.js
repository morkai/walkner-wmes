// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/lossReasons',

    clientUrlRoot: '#lossReasons',

    topicPrefix: 'lossReasons',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'lossReasons',

    labelAttribute: 'label',

    defaults: {
      label: null,
      position: 0
    },

    toJSON: function()
    {
      var lossReason = Model.prototype.toJSON.call(this);

      if (!lossReason.label)
      {
        lossReason.label = lossReason._id;
      }

      return lossReason;
    }

  });
});
