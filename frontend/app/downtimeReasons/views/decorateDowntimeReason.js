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
