// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/settings/changes',

    clientUrlRoot: '#settings/changes',

    topicPrefix: 'settings.changes',

    privilegePrefix: 'SETTINGS',

    nlsDomain: 'core'

  });
});
