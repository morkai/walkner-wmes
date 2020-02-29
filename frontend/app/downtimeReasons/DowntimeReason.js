// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../i18n',
  '../core/Model',
  '../data/aors',
  'app/core/util/colorLabel'
], function(
  t,
  Model,
  aors,
  colorLabel
) {
  'use strict';

  var SUBDIVISION_TYPES = ['assembly', 'press', 'paintShop', 'wh-pickup', 'wh-dist'];

  return Model.extend({

    urlRoot: '/downtimeReasons',

    clientUrlRoot: '#downtimeReasons',

    topicPrefix: 'downtimeReasons',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'downtimeReasons',

    labelAttribute: 'label',

    defaults: function()
    {
      return {
        label: null,
        type: 'other',
        subdivisionTypes: SUBDIVISION_TYPES,
        opticsPosition: -1,
        pressPosition: -1,
        auto: false,
        scheduled: false,
        color: '#ff0000',
        refColor: '#aa0000',
        refValue: 0,
        aors: [],
        defaultAor: false
      };
    },

    serialize: function()
    {
      var nlsDomain = this.nlsDomain;
      var obj = this.toJSON();

      obj.scheduled = t('core', 'BOOL:' + obj.scheduled);
      obj.auto = t('core', 'BOOL:' + obj.auto);
      obj.type = t(nlsDomain, 'type:' + obj.type);
      obj.color = colorLabel(obj.color);
      obj.refColor = colorLabel(obj.refColor);
      obj.refValue = obj.refValue && obj.refValue.toLocaleString ? obj.refValue.toLocaleString() : '0';

      if (!obj.subdivisionTypes || !obj.subdivisionTypes.length)
      {
        obj.subdivisionTypes = t(nlsDomain, 'subdivisionType:none');
      }
      else
      {
        obj.subdivisionTypes = obj.subdivisionTypes
          .map(function(subdivisionType) { return t(nlsDomain, 'subdivisionType:' + subdivisionType); })
          .join('; ');
      }

      obj.aors = obj.aors.map(function(aorId)
      {
        var aor = aors.get(aorId);

        return aor ? aor.getLabel() : aorId;
      });

      obj.defaultAor = t('core', 'BOOL:' + obj.defaultAor);

      return obj;
    },

    serializeRow: function()
    {
      var obj = this.serialize();

      obj.aors = obj.aors.length ? obj.aors.join('; ') : t(this.nlsDomain, 'aors:all');

      return obj;
    }

  }, {

    SUBDIVISION_TYPES: SUBDIVISION_TYPES

  });
});
