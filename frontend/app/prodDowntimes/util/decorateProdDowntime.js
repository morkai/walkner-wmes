// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/time',
  'app/i18n',
  'app/user',
  'app/data/aors',
  'app/data/subdivisions',
  'app/data/mrpControllers',
  'app/data/prodFlows',
  'app/data/prodLines',
  'app/data/downtimeReasons',
  'app/data/views/renderOrgUnitPath',
  'app/core/templates/userInfo',
  './decorateProdDowntimeChange'
], function(
  time,
  t,
  user,
  aors,
  subdivisions,
  mrpControllers,
  prodFlows,
  prodLines,
  downtimeReasons,
  renderOrgUnitPath,
  renderUserInfo,
  decorateProdDowntimeChange
) {
  'use strict';

  return function decorateProdDowntime(prodDowntime, options)
  {
    var longDateFormat = options && options.longDate ? 'LLLL' : 'YYYY-MM-DD, HH:mm:ss';
    var obj = prodDowntime.toJSON();

    obj.statusClassName = prodDowntime.getCssClassName();
    obj.statusText = t('prodDowntimes', 'PROPERTY:status:' + obj.status);

    obj.className = obj.statusClassName;

    if (obj.reasonComment && obj.reasonComment.trim().length)
    {
      obj.className += ' is-withReasonComment';
    }

    var aor = aors.get(obj.aor);

    obj.aor = aor ? aor.getLabel() : obj.aor;

    var prodLine = prodLines.get(obj.prodLine);

    if (prodLine)
    {
      obj.prodLine = prodLine.getLabel();
      obj.prodLinePath = renderOrgUnitPath(prodLine, false, false);
    }

    var reason = downtimeReasons.get(obj.reason);

    obj.reason = reason ? reason.getLabel() : obj.reason;

    if (obj.startedAt && obj.finishedAt)
    {
      var startTime = Date.parse(obj.startedAt);
      var endTime = Date.parse(obj.finishedAt);
      var duration = Math.round((endTime - startTime) / 1000);

      obj.duration = time.toString(duration);
    }
    else
    {
      obj.duration = '-';
    }

    obj.startedAt = time.format(obj.startedAt, longDateFormat);

    obj.finishedAt = obj.finishedAt
      ? time.format(obj.finishedAt, longDateFormat)
      : t('prodDowntimes', 'NO_DATA:finishedAt');

    obj.corroboratedAt = time.format(obj.corroboratedAt, longDateFormat) || '-';

    obj.order = obj.prodShiftOrder
      ? (obj.orderId + '; ' + obj.operationNo)
      : t('prodDowntimes', 'NO_DATA:order');

    if (user.isAllowedTo('PROD_DATA:VIEW') && obj.prodShiftOrder)
    {
      obj.order = '<a href="#prodShiftOrders/' + obj.prodShiftOrder + '">' + obj.order + '</a>';
    }

    obj.date = obj.date ? time.format(obj.date, 'YYYY-MM-DD') : '?';
    obj.shift = obj.shift ? t('core', 'SHIFT:' + obj.shift) : '?';
    obj.prodShiftText = obj.date + ', ' + obj.shift;

    if (user.isAllowedTo('PROD_DATA:VIEW') && obj.prodShift)
    {
      obj.prodShiftText = '<a href="#prodShifts/' + obj.prodShift + '">' + obj.prodShiftText + '</a>';
    }

    obj.masterInfo = renderUserInfo({userInfo: obj.master});
    obj.leaderInfo = renderUserInfo({userInfo: obj.leader});
    obj.operatorInfo = renderUserInfo({userInfo: obj.operator});
    obj.creatorInfo = renderUserInfo({userInfo: obj.creator});
    obj.corroboratorInfo = renderUserInfo({userInfo: obj.corroborator});

    var subdivision = subdivisions.get(obj.subdivision);
    var prodFlow = prodFlows.get(obj.prodFlow);

    obj.subdivision = subdivision ? subdivision.getLabel() : '?';
    obj.prodFlow = prodFlow ? prodFlow.getLabel() : '?';
    obj.mrpControllers =
      Array.isArray(obj.mrpControllers) && obj.mrpControllers.length
        ? obj.mrpControllers.join('; ')
        : '?';

    obj.history = Array.isArray(obj.changes) && (!options || options.noHistory !== true)
      ? obj.changes.map(decorateProdDowntimeChange)
      : [];

    var changesCount = obj.changesCount;

    if (changesCount && options && options.changesCount)
    {
      if (changesCount.reason)
      {
        obj.reason += ' <span title="' + t('prodDowntimes', 'changesCount:reason') + '" class="label label-'
          + (changesCount.reason >= options.maxReasonChanges ? 'danger' : 'warning')
          + '">' + changesCount.reason + '</span>';
      }

      if (changesCount.aor)
      {
        obj.aor += ' <span title="' + t('prodDowntimes', 'changesCount:aor') + '" class="label label-'
          + (changesCount.aor >= options.maxAorChanges ? 'danger' : 'warning')
          + '">' + changesCount.aor + '</span>';
      }
    }

    return obj;
  };
});
