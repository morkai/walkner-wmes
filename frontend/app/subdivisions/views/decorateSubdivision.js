// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/data/aors',
  'app/data/downtimeReasons',
  'app/data/divisions',
  'app/data/views/renderOrgUnitPath'
],
function(
  t,
  aors,
  downtimeReasons,
  divisions,
  renderOrgUnitPath
) {
  'use strict';

  return function decorateSubdivision(model)
  {
    var obj = model.toJSON();

    obj.division = renderOrgUnitPath(divisions.get(obj.division), true, false);
    obj.type = t('subdivisions', 'TYPE:' + obj.type);
    obj.prodTaskTags = obj.prodTaskTags && obj.prodTaskTags.length ? obj.prodTaskTags.join('; ') : null;

    var aor = aors.get(obj.aor);
    obj.aor = aor ? aor.getLabel() : '-';

    var autoDowntime = downtimeReasons.get(obj.autoDowntime);
    obj.autoDowntime = autoDowntime ? autoDowntime.getLabel() : '-';

    return obj;
  };
});
