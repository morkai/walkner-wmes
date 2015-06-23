// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/kaizen/risks',

    clientUrlRoot: '#kaizenRisks',

    topicPrefix: 'kaizen.risks',

    privilegePrefix: 'KAIZEN:DICTIONARIES',

    nlsDomain: 'kaizenRisks',

    labelAttribute: 'name',

    defaults: {},

    serialize: function()
    {
      var obj = this.toJSON();

      if (!obj.description)
      {
        obj.description = '-';
      }

      return obj;
    }

  });
});
