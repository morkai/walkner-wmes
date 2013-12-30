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
      type: 'assembly',
      name: null,
      prodTaskTags: null
    }

  });
});
