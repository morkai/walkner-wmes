// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/broker'
], function(
  broker
) {
  'use strict';

  var STORAGE_KEY = 'PRODUCTION:SN';

  var enabled = true;
  var handleTimeout = null;
  var scanBuffer = '';
  var snBuffer = JSON.parse(localStorage[STORAGE_KEY] || '{}');

  broker.subscribe('viewport.dialog.shown', function() { enabled = false; });
  broker.subscribe('viewport.dialog.hidden', function() { enabled = true; });

  function handleScanBuffer()
  {
    var matches = scanBuffer.match(/P0*([0-9]+)([0-9]{4})/);
    var type = 'old';

    if (!matches)
    {
      matches = scanBuffer.match(/[A-Z0-9]{4}\.([0-9]+)\.([0-9]+)/);
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
    else if (scanBuffer.length > 5)
    {
      broker.publish('production.taktTime.snScanned', {
        _id: scanBuffer,
        scannedAt: new Date(),
        orderNo: null,
        serialNo: null
      });
    }

    scanBuffer = '';
  }

  return {
    handleKeyboardEvent: function(e)
    {
      if (!enabled || e.target.classList.contains('form-control'))
      {
        return;
      }

      var is09 = e.which >= 48 && e.which <= 57;
      var isAZ = e.which >= 65 && e.which <= 90;
      var isDot = e.which === 190;

      if (is09 || isAZ || isDot)
      {
        scanBuffer += isDot ? '.' : String.fromCharCode(e.which);

        clearTimeout(handleTimeout);
        handleTimeout = setTimeout(handleScanBuffer, 50);
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
