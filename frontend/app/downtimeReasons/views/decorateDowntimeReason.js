// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n'
], function(
  t
) {
  'use strict';

  return function decorateDowntimeReason(model)
  {
    var obj = model.toJSON();

    obj.scheduled = t('core', 'BOOL:' + obj.scheduled);
    obj.auto = t('core', 'BOOL:' + obj.auto);
    obj.type = t('downtimeReasons', 'type:' + obj.type);
    obj.subdivisionTypes = !obj.subdivisionTypes || !obj.subdivisionTypes.length
      ? t('downtimeReasons', 'subdivisionType:none')
      : obj.subdivisionTypes.map(function(subdivisionType)
        {
          return t('downtimeReasons', 'subdivisionType:' + subdivisionType);
        }).join('; ');

    return obj;
  };
});
