// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/time',
  'app/i18n',
  'app/data/aors',
  'app/data/downtimeReasons',
  'app/core/templates/userInfo'
], function(
  _,
  time,
  t,
  aors,
  downtimeReasons,
  renderUserInfo
) {
  'use strict';

  var SPECIAL_CHANGES = {
    'WMES:ALERTS:START': function(data)
    {
      var alert = data.alert;

      return t('prodDowntimes', 'comments:alerts:start', {
        alertName: alert.name,
        recipientCount: alert.recipients.length,
        recipientList: alert.recipients.join(', ')
      });
    },
    'WMES:ALERTS:NOTIFY': function(data)
    {
      var alert = data.alert;

      return t('prodDowntimes', 'comments:alerts:notify', {
        alertName: alert.name,
        recipientCount: alert.recipients.length,
        recipientList: alert.recipients.join(', ')
      });
    },
    'WMES:ALERTS:FINISH': function(data)
    {
      return t('prodDowntimes', 'comments:alerts:finish', {
        alertName: data.alert.name
      });
    }
  };

  function formatValue(property, value)
  {
    switch (property)
    {
      case 'startedAt':
      case 'finishedAt':
        return time.format(value, 'YYYY-MM-DD, HH:mm:ss');

      case 'master':
      case 'leader':
      case 'operator':
        return renderUserInfo({userInfo: value});

      case 'status':
        return t('prodDowntimes', 'PROPERTY:status:' + value);

      case 'reason':
      {
        var reason = downtimeReasons.get(value);

        return reason ? reason.getLabel() : value;
      }

      case 'aor':
      {
        var aor = aors.get(value);

        return aor ? aor.getLabel() : value;
      }

      default:
        return value || '';
    }
  }

  return function decorateProdDowntimeChange(change)
  {
    var special = /^WMES:/.test(change.comment) ? SPECIAL_CHANGES[change.comment] : null;

    return {
      time: time.toTagData(change.date),
      user: renderUserInfo({userInfo: change.user}),
      changes: special ? [] : _.map(change.data, function(values, property)
      {
        return {
          label: t('prodDowntimes', 'PROPERTY:' + property),
          oldValue: formatValue(property, values[0]),
          newValue: formatValue(property, values[1])
        };
      }),
      comment: special ? special(change.data) : change.comment.trim()
    };
  };
});
