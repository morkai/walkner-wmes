// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../settings/Setting'
], function(
  Setting
) {
  'use strict';

  return Setting.extend({

    urlRoot: '/compRel/settings',

    nlsDomain: 'wmes-compRel-entries'

  });
});
