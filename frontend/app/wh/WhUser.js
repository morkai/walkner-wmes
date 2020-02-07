// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../i18n',
  '../core/Model'
], function(
  t,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/old/wh/users',

    topicPrefix: 'old.wh.users',

    privilegePrefix: 'WH',

    nlsDomain: 'wh',

    labelAttribute: 'label'

  });
});
