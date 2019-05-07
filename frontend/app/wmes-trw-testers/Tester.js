// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/trw/testers',

    clientUrlRoot: '#trw/testers',

    topicPrefix: 'trw.testers',

    privilegePrefix: 'TRW',

    nlsDomain: 'wmes-trw-testers',

    labelAttribute: 'name'

  }, {

    IO_TYPES: ['input', 'output', 'analog']

  });
});
