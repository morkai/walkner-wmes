// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
