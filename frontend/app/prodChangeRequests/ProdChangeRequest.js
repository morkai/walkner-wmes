// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/prodChangeRequests',

    clientUrlRoot: '#prodChangeRequests',

    topicPrefix: 'prodChangeRequests',

    privilegePrefix: 'PROD_DATA:CHANGES',

    nlsDomain: 'prodChangeRequests',

    getModelId: function()
    {
      var modelId = this.get('modelId');

      if (!modelId)
      {
        var data = this.get('data');

        if (data && data._id)
        {
          modelId = data._id;
        }
      }

      return modelId;
    },

    isFte: function()
    {
      var modelType = this.get('modelType');

      return modelType === 'fteMaster' || modelType === 'fteLeader';
    }

  });
});
