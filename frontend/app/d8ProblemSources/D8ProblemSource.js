// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/d8/problemSources',

    clientUrlRoot: '#d8/problemSources',

    topicPrefix: 'd8.problemSources',

    privilegePrefix: 'D8:DICTIONARIES',

    nlsDomain: 'd8ProblemSources',

    labelAttribute: 'name'

  });
});
