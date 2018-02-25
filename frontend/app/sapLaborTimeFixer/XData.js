// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/sapLaborTimeFixer',

    clientUrlRoot: '#sapLaborTimeFixer',

    topicPrefix: 'sapLaborTimeFixer',

    privilegePrefix: 'ORDERS',

    nlsDomain: 'sapLaborTimeFixer'

  });
});
