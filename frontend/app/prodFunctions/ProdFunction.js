// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../i18n',
  '../data/companies',
  '../core/Model',
  'app/core/util/colorLabel'
], function(
  t,
  companies,
  Model,
  colorLabel
) {
  'use strict';

  return Model.extend({

    urlRoot: '/prodFunctions',

    clientUrlRoot: '#prodFunctions',

    topicPrefix: 'prodFunctions',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'prodFunctions',

    labelAttribute: 'label',

    defaults: function()
    {
      return {
        label: '',
        direct: false,
        dirIndirRatio: 100,
        color: '#000000'
      };
    },

    serialize: function()
    {
      var obj = this.toJSON();

      if (!obj.label)
      {
        obj.label = obj._id;
      }

      obj.dirIndirRatio = obj.direct
        ? (obj.dirIndirRatio.toLocaleString() + ' / ' + (100 - obj.dirIndirRatio).toLocaleString())
        : '-';

      obj.direct = t('prodFunctions', 'direct:' + obj.direct);

      obj.color = colorLabel(obj.color);

      return obj;
    }

  });
});
