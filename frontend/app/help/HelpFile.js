// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/help/files',

    clientUrlRoot: '#help',

    topicPrefix: 'help.files',

    privilegePrefix: 'HELP',

    nlsDomain: 'help'

  });
});
