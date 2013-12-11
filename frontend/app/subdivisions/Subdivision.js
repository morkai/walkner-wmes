define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/subdivisions',

    clientUrlRoot: '#subdivisions',

    topicPrefix: 'subdivisions',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'subdivisions',

    labelAttribute: 'name',

    defaults: {
      division: null,
      name: null,
      prodTaskTags: null
    }

  });
});
