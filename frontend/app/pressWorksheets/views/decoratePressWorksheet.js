define([
  'app/time',
  'app/i18n'
], function(
  time,
  t
) {
  'use strict';

  function formatUser(user)
  {
    return user && user.label ? user.label : null;
  }

  return function(data)
  {
    /*jshint -W015*/

    data.date = time.format(data.date, 'YYYY-MM-DD');
    data.shift = t('core', 'SHIFT:' + data.shift);
    data.master = formatUser(data.master);
    data.operator = formatUser(data.operator);
    data.operators = (data.operators || [])
      .map(formatUser)
      .filter(function(user) { return !!user; });
    data.creator = formatUser(data.creator);
    data.createdAt = data.createdAt ? time.format(data.createdAt, 'LLLL') : null;

    return data;
  };
});
