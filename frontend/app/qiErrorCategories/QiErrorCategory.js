// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/qi/errorCategories',

    clientUrlRoot: '#qi/errorCategories',

    topicPrefix: 'qi.errorCategories',

    privilegePrefix: 'QI:DICTIONARIES',

    nlsDomain: 'qiErrorCategories',

    labelAttribute: 'name'

  });
});
