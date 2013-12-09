define([
  'moment-timezone',
  'app/socket',
  'moment-timezone-data'
], function(
  moment,
  socket
) {
  'use strict';

  var OFFSET_STORAGE_KEY = 'TIME:OFFSET';
  var TZ_STORAGE_KEY = 'TIME:ZONE';

  var time = {
    synced: false,
    offset: parseFloat(localStorage.getItem(OFFSET_STORAGE_KEY)) || 0,
    zone: localStorage.getItem(TZ_STORAGE_KEY) || 'Europe/Warsaw',
    appData: window.TIME || 0
  };

  delete window.TIME;

  time.sync = function()
  {
    var startTime = Date.now();

    socket.emit('time', function(serverTime, serverTz)
    {
      time.offset = ((serverTime - startTime) + (serverTime - Date.now())) / 2;
      time.zone = serverTz;
      time.synced = true;

      localStorage.setItem(OFFSET_STORAGE_KEY, time.offset.toString());
      localStorage.setItem(TZ_STORAGE_KEY, time.zone);
    });
  };

  time.getServerMoment = function()
  {
    return moment(Date.now() + time.offset).tz(time.zone);
  };

  time.getMoment = function(date)
  {
    return moment(date).tz(time.zone);
  };

  time.format = function(date, format)
  {
    return time.getMoment(date).format(format);
  };

  /**
   * @param {string} str
   * @returns {number}
   */
  time.toSeconds = function(str)
  {
    if (typeof str === 'number')
    {
      return str;
    }

    if (typeof str !== 'string')
    {
      return 0;
    }

    var multipliers = {
      g: 3600,
      h: 3600,
      m: 60,
      s: 1
    };

    var time = str.trim();
    var seconds = parseInt(time, 10);

    if (/^[0-9]+\.?[0-9]*$/.test(time) === false)
    {
      var re = /([0-9\.]+) *(h|m|s)[a-z]*/ig;
      var match;

      seconds = 0;

      while ((match = re.exec(time)))
      {
        seconds += match[1] * multipliers[match[2].toLowerCase()];
      }
    }

    return seconds;
  };

  /**
   * @param {number} time
   * @param {boolean} [compact]
   * @returns {string}
   */
  time.toString = function(time, compact)
  {
    if (typeof time !== 'number' || time <= 0)
    {
      return compact ? '00:00:00' : '0s';
    }

    var str = '';
    var hours = Math.floor(time / 3600);

    if (hours > 0)
    {
      str += compact ? (rpad0(hours, 2) + ':') : (' ' + hours + 'h');
      time = time % 3600;
    }
    else if (compact)
    {
      str += '00:';
    }

    var minutes = Math.floor(time / 60);

    if (minutes > 0)
    {
      str += compact ? (rpad0(minutes, 2) + ':') : (' ' + minutes + 'min');
      time = time % 60;
    }
    else if (compact)
    {
      str += '00:';
    }

    var seconds = time;

    if (seconds >= 1)
    {
      str += compact
        ? rpad0(Math.round(seconds), 2)
        : (' ' + Math.round(seconds) + 's');
    }
    else if (seconds > 0 && str === '')
    {
      str += ' ' + (seconds * 1000) + 'ms';
    }
    else if (compact)
    {
      str += '00';
    }

    return compact ? str : str.substr(1);
  };

  function rpad0(val, length)
  {
    val = String(val);

    while (val.length < length)
    {
      val = '0' + val;
    }

    return val;
  }

  socket.on('connect', function()
  {
    time.sync();
  });

  if (socket.isConnected())
  {
    time.sync();
  }

  window.time = time;

  return time;
});
