// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/time'
], function(
  t,
  time
) {
  'use strict';

  return function decorateLogEntry(logEntry)
  {
    if (logEntry.duration)
    {
      logEntry.duration = time.toString(logEntry.duration / 1000, false, true);
    }

    if (logEntry.errorCode)
    {
      logEntry.error = t('xiconf', 'error:' + logEntry.errorCode);
    }

    var moment = time.getMoment(logEntry.time);

    return {
      datetime: moment.toISOString(),
      time: moment.format('HH:mm:ss.SSS'),
      text: t('xiconf', 'log:' + logEntry.text, logEntry)
    };
  };
});
