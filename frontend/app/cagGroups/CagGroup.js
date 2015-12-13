// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../core/Model',
  'app/core/util/colorLabel'
], function(
  Model,
  colorLabel
) {
  'use strict';

  return Model.extend({

    urlRoot: '/cagGroups',

    clientUrlRoot: '#cagGroups',

    topicPrefix: 'cagGroups',

    privilegePrefix: 'REPORTS',

    nlsDomain: 'cagGroups',

    labelAttribute: 'name',

    defaults: {
      color: '#FFFFFF'
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.color = colorLabel(obj.color);
      obj.cags = obj.cags.join(', ');

      return obj;
    }

  });
});
