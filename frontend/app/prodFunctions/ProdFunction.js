define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/prodFunctions',

    clientUrlRoot: '#prodFunctions',

    topicPrefix: 'prodFunctions',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'prodFunctions',

    labelAttribute: 'label',

    defaults: function()
    {
      return {
        label: '',
        fteMasterPosition: -1,
        direct: false,
        companies: []
      };
    },

    toJSON: function()
    {
      var prodFunction = Model.prototype.toJSON.call(this);

      if (!prodFunction.label)
      {
        prodFunction.label = prodFunction._id;
      }

      return prodFunction;
    }

  });
});
