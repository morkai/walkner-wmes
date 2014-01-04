define([
  'app/time',
  'app/i18n',
  'app/data/aors',
  'app/data/prodLines',
  'app/data/downtimeReasons',
  'app/data/views/renderOrgUnitPath',
  'app/core/templates/userInfo',
  'i18n!app/nls/prodDowntimes'
], function(
  time,
  t,
  aors,
  prodLines,
  downtimeReasons,
  renderOrgUnitPath,
  renderUserInfo
) {
  'use strict';

  return function(prodDowntimeModel)
  {
    /*jshint -W015*/

    var prodDowntime = prodDowntimeModel.toJSON();

    prodDowntime.statusClassName = prodDowntimeModel.getCssClassName();

    prodDowntime.className = prodDowntime.statusClassName;

    if (prodDowntime.reasonComment && prodDowntime.reasonComment.trim().length)
    {
      prodDowntime.className += ' is-withReasonComment';
    }

    var aor = aors.get(prodDowntime.aor);

    prodDowntime.aor = aor ? aor.getLabel() : prodDowntime.aor;

    var prodLine = prodLines.get(prodDowntime.prodLine);

    if (prodLine)
    {
      prodDowntime.prodLine = prodLine.getLabel();
      prodDowntime.prodLinePath = renderOrgUnitPath(prodLine, false, false);
    }

    var reason = downtimeReasons.get(prodDowntime.reason);

    prodDowntime.reason = reason ? reason.getLabel() : prodDowntime.reason;

    if (prodDowntime.startedAt && prodDowntime.finishedAt)
    {
      var startTime = Date.parse(prodDowntime.startedAt);
      var endTime = Date.parse(prodDowntime.finishedAt);
      var duration = Math.round((endTime - startTime) / 1000);

      prodDowntime.duration = time.toString(duration);
    }
    else
    {
      prodDowntime.duration = '-';
    }

    prodDowntime.startedAt = time.format(prodDowntime.startedAt, 'YYYY-MM-DD HH:mm:ss');

    prodDowntime.finishedAt = prodDowntime.finishedAt
      ? time.format(prodDowntime.finishedAt, 'YYYY-MM-DD HH:mm:ss')
      : t('prodDowntimes', 'NO_DATA:finishedAt');

    prodDowntime.corroboratedAt =
      time.format(prodDowntime.corroboratedAt, 'YYYY-MM-DD HH:mm:ss') || '-';

    prodDowntime.order = prodDowntime.prodShiftOrder
      ? prodDowntime.orderId
      : t('prodDowntimes', 'NO_DATA:order');

    prodDowntime.date = prodDowntime.date ? time.format(prodDowntime.date, 'YYYY-MM-DD') : '?';

    prodDowntime.shift = prodDowntime.shift ? t('core', 'SHIFT:' + prodDowntime.shift) : '?';

    prodDowntime.masterInfo = renderUserInfo({userInfo: prodDowntime.master});
    prodDowntime.leaderInfo = renderUserInfo({userInfo: prodDowntime.leader});
    prodDowntime.operatorInfo = renderUserInfo({userInfo: prodDowntime.operator});
    prodDowntime.creatorInfo = renderUserInfo({userInfo: prodDowntime.creator});
    prodDowntime.corroboratorInfo = renderUserInfo({userInfo: prodDowntime.corroborator});

    return prodDowntime;
  };
});
