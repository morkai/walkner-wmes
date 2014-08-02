// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../core/Model',
  'app/core/templates/colorLabel'
], function(
  Model,
  colorLabelTemplate
) {
  'use strict';

  return Model.extend({

    urlRoot: '/companies',

    clientUrlRoot: '#companies',

    topicPrefix: 'companies',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'companies',

    labelAttribute: 'name',

    defaults: {
      name: null,
      fteMasterPosition: -1,
      fteLeaderPosition: -1,
      color: '#000000'
    },

    serialize: function()
    {
      var obj = this.toJSON();

      if (!obj.name)
      {
        obj.name = obj._id;
      }

      obj.color = colorLabelTemplate({color: obj.color});

      return obj;
    }

  });
});
