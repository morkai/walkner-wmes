// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/kaizen/areas',

    clientUrlRoot: '#kaizenAreas',

    topicPrefix: 'kaizen.areas',

    privilegePrefix: 'KAIZEN:DICTIONARIES',

    nlsDomain: 'kaizenAreas',

    labelAttribute: 'name',

    defaults: {}

  });
});
