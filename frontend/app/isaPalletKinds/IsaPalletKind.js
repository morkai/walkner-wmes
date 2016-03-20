// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/isaPalletKinds',

    clientUrlRoot: '#isaPalletKinds',

    topicPrefix: 'isaPalletKinds',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'isaPalletKinds',

    labelAttribute: 'shortName'

  });
});
