// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/pkhdStrategies',

    clientUrlRoot: '#pkhdStrategies',

    topicPrefix: 'pkhdStrategies',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'pkhdStrategies',

    labelAttribute: 'name'

  });
});
