// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/qi/actionStatuses',

    clientUrlRoot: '#qi/actionStatuses',

    topicPrefix: 'qi.actionStatuses',

    privilegePrefix: 'QI:DICTIONARIES',

    nlsDomain: 'qiActionStatuses',

    labelAttribute: 'name',

    defaults: {
      position: 0
    }

  });
});
