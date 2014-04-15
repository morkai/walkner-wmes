// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../core/Model',
  'app/data/mrpControllers',
  'app/data/prodFlows'
], function(
  Model,
  mrpControllers,
  prodFlows
) {
  'use strict';

  return Model.extend({

    urlRoot: '/workCenters',

    clientUrlRoot: '#workCenters',

    topicPrefix: 'workCenters',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'workCenters',

    labelAttribute: '_id',

    defaults: {
      mrpController: null,
      prodFlow: null,
      description: null
    },

    getSubdivision: function()
    {
      var mrpController;

      if (this.get('mrpController'))
      {
        mrpController = mrpControllers.get(this.get('mrpController'));
      }
      else
      {
        var prodFlow = prodFlows.get(this.get('prodFlow'));

        if (prodFlow)
        {
          mrpController = mrpControllers.get((prodFlow.get('mrpController') || [])[0]);
        }
      }

      return mrpController ? mrpController.getSubdivision() : null;
    }

  });
});
