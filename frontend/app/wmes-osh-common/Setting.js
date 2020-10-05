// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/settings/Setting'
], function(
  Setting
) {
  'use strict';

  return Setting.extend({

    urlRoot: '/osh/settings',

    nlsDomain: 'wmes-osh-common'

  });
});
