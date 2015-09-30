// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
    }

  });
});
