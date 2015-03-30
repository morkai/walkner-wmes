// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../i18n',
  '../core/Model',
  '../data/aors',
  'app/core/templates/colorLabel'
], function(
  t,
  Model,
  aors,
  colorLabelTemplate
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
        subdivisionTypes: ['assembly', 'press'],
        opticsPosition: -1,
        pressPosition: -1,
        auto: false,
        scheduled: false,
        color: '#ff0000',
        refColor: '#aa0000',
        refValue: 0,
        aors: []
      };
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.scheduled = t('core', 'BOOL:' + obj.scheduled);
      obj.auto = t('core', 'BOOL:' + obj.auto);
      obj.type = t('downtimeReasons', 'type:' + obj.type);
      obj.color = colorLabelTemplate({color: obj.color});
      obj.refColor = colorLabelTemplate({color: obj.refColor});
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

      return obj;
    }

  });
});
