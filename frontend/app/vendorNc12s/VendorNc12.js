// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/vendorNc12s',

    clientUrlRoot: '#vendorNc12s',

    topicPrefix: 'vendorNc12s',

    privilegePrefix: 'VENDOR_NC12S',

    nlsDomain: 'vendorNc12s',

    labelAttribute: 'nc12',

    defaults: {}

  });
});
