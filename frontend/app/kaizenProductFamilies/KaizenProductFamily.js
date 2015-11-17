// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../core/Model',
  'app/core/templates/userInfo'
], function(
  Model,
  renderUserInfo
) {
  'use strict';

  return Model.extend({

    urlRoot: '/kaizen/productFamilies',

    clientUrlRoot: '#kaizenProductFamilies',

    topicPrefix: 'kaizen.productFamilies',

    privilegePrefix: 'KAIZEN:DICTIONARIES',

    nlsDomain: 'kaizenProductFamilies',

    labelAttribute: 'name',

    defaults: {},

    serialize: function()
    {
      var obj = this.toJSON();

      if (!obj.owners)
      {
        obj.owners = [];
      }
      else
      {
        obj.owners = obj.owners.map(function(o) { return renderUserInfo({userInfo: o}); });
      }

      return obj;
    },

    serializeRow: function()
    {
      var obj = this.serialize();

      obj.owners = obj.owners.join('; ');

      return obj;
    }

  });
});
