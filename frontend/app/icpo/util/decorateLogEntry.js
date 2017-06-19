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
    var isProgrammingFailure = logEntry.text === 'PROGRAMMING_FAILURE';

    if (isProgrammingFailure || logEntry.text === 'PROGRAMMING_SUCCESS')
    {
      if (typeof logEntry.duration === 'number')
      {
        logEntry.duration = time.toString(logEntry.duration / 1000, false, true);
      }

      if (isProgrammingFailure)
      {
        logEntry.error = t('icpo', 'error:' + logEntry.errorCode);
      }
    }

    var moment = time.getMoment(logEntry.time);

    return {
      datetime: moment.toISOString(),
      time: moment.format('HH:mm:ss.SSS'),
      text: t('icpo', 'log:' + logEntry.text, logEntry)
    };
  };
});
