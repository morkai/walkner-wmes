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

    urlRoot: '/aors',

    clientUrlRoot: '#aors',

    topicPrefix: 'aors',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'aors',

    labelAttribute: 'name',
    
    defaults: {
      name: null,
      description: null,
      color: '#f08f44',
      refColor: '#ffa85c',
      refValue: 0
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.color = colorLabelTemplate({color: obj.color});
      obj.refColor = colorLabelTemplate({color: obj.refColor});
      obj.refValue = obj.refValue && obj.refValue.toLocaleString ? obj.refValue.toLocaleString() : '0';

      return obj;
    },

    serializeDetails: function()
    {
      return this.serialize();
    },

    serializeRow: function()
    {
      return this.serialize();
    }

  });
});
