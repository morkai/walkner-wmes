// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/data/aors',
  'app/data/downtimeReasons',
  'app/data/divisions',
  'app/data/views/renderOrgUnitPath'
],
function(
  _,
  t,
  aors,
  downtimeReasons,
  divisions,
  renderOrgUnitPath
) {
  'use strict';

  return function decorateSubdivision(model, details)
  {
    var obj = model.toJSON();

    obj.division = renderOrgUnitPath(divisions.get(obj.division), true, false);
    obj.type = t('subdivisions', 'TYPE:' + obj.type);
    obj.prodTaskTags = obj.prodTaskTags && obj.prodTaskTags.length ? obj.prodTaskTags.join('; ') : null;

    var aor = aors.get(obj.aor);
    obj.aor = aor ? aor.getLabel() : '-';

    obj.autoDowntimes = _.map(obj.autoDowntimes, function(autoDowntime)
    {
      var reason = downtimeReasons.get(autoDowntime.reason);

      return !reason ? null : {
        reason: reason.getLabel(),
        when: autoDowntime.when
      };
    }).filter(function(autoDowntime)
    {
      return !!autoDowntime;
    });

    if (details !== true)
    {
      obj.autoDowntimes = obj.autoDowntimes.length === 0 ? '-' : obj.autoDowntimes
        .map(function(autoDowntime) { return autoDowntime.reason; })
        .join('; ');
    }

    return obj;
  };
});
