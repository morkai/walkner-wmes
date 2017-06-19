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
        subdivisionTypes: ['assembly', 'press', 'paintShop'],
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
      var obj = this.toJSON();

      obj.scheduled = t('core', 'BOOL:' + obj.scheduled);
      obj.auto = t('core', 'BOOL:' + obj.auto);
      obj.type = t('downtimeReasons', 'type:' + obj.type);
      obj.color = colorLabel(obj.color);
      obj.refColor = colorLabel(obj.refColor);
      obj.refValue = obj.refValue && obj.refValue.toLocaleString ? obj.refValue.toLocaleString() : '0';

      if (!obj.subdivisionTypes || !obj.subdivisionTypes.length)
      {
        obj.subdivisionTypes = t('downtimeReasons', 'subdivisionType:none');
      }
      else
      {
        obj.subdivisionTypes = obj.subdivisionTypes
          .map(function(subdivisionType) { return t('downtimeReasons', 'subdivisionType:' + subdivisionType); })
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

      obj.aors = obj.aors.length ? obj.aors.join('; ') : t('downtimeReasons', 'aors:all');

      return obj;
    }

  });
});
