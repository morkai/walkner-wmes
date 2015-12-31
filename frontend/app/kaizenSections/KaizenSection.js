// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/kaizen/sections',

    clientUrlRoot: '#kaizenSections',

    topicPrefix: 'kaizen.sections',

    privilegePrefix: 'KAIZEN:DICTIONARIES',

    nlsDomain: 'kaizenSections',

    labelAttribute: 'name',

    defaults: {}

  });
});
