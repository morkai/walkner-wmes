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

    urlRoot: '/vendorNc12s',

    clientUrlRoot: '#vendorNc12s',

    topicPrefix: 'vendorNc12s',

    privilegePrefix: 'VENDOR_NC12S',

    nlsDomain: 'vendorNc12s',

    labelAttribute: 'nc12',

    defaults: {}

  });
});
