// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/ct/mrpConfigs',

    clientUrlRoot: '#ct/mrpConfigs',

    topicPrefix: 'ct.mrpConfigs',

    privilegePrefix: 'PROD_DATA',

    nlsDomain: 'wmes-ct-pces'

  });
});
