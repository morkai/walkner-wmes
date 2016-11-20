// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/broker'
], function(
  broker
) {
  'use strict';

  var STORAGE_KEY = 'PRODUCTION:SN';

  var handleTimeout = null;
  var scanBuffer = '';
  var snBuffer = JSON.parse(localStorage[STORAGE_KEY] || '{}');

  function handleScanBuffer()
  {
    var matches = scanBuffer.match(/^P0*([0-9]+)([0-9]{4})/);
    var type = 'old';

    if (!matches)
    {
      matches = scanBuffer.match(/^[A-Z0-9]{4}\.([0-9]+)\.([0-9]+)/);
      type = 'new';
    }

    if (matches)
    {
      broker.publish('production.taktTime.snScanned', {
        _id: matches[0],
        scannedAt: new Date(),
        orderNo: matches[1],
        serialNo: +matches[2]
      });
    }

    scanBuffer = '';
  }

  return {
    handleKeyboardEvent: function(e)
    {
      var is09 = e.which >= 48 && e.which <= 57;
      var isAZ = e.which >= 65 && e.which <= 90;
      var isDot = e.which === 190;

      if (is09 || isAZ || isDot)
      {
        scanBuffer += isDot ? '.' : String.fromCharCode(e.which);

        clearTimeout(handleTimeout);
        handleTimeout = setTimeout(handleScanBuffer, 100);
      }
    },
    contains: function(sn)
    {
      return !!snBuffer[sn._id];
    },
    add: function(sn)
    {
      snBuffer[sn._id] = 1;
      localStorage[STORAGE_KEY] = JSON.stringify(snBuffer);
    },
    clear: function()
    {
      snBuffer = {};
      localStorage.removeItem(STORAGE_KEY);
    }
  };
});
