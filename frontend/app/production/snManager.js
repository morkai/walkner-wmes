// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/broker'
], function(
  _,
  broker
) {
  'use strict';

  var STORAGE_KEY = 'PRODUCTION:SN';

  var handleTimeout = null;
  var scanBuffer = '';
  var snBuffer = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

  function handleScanBuffer()
  {
    var matches = scanBuffer.match(/P0*([0-9]+)([0-9]{4})/);

    if (!matches)
    {
      matches = scanBuffer.match(/[A-Z0-9]{4}\.([0-9]+)\.([0-9]+)/);
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
      if (e.target.classList.contains('form-control')
        && e.target.dataset.snAccept === undefined)
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
      return !!snBuffer[sn];
    },
    add: function(sn)
    {
      snBuffer[sn._id] = [Date.parse(sn.scannedAt), sn.prodShiftOrder, sn.prodLine];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snBuffer));
    },
    clear: function()
    {
      snBuffer = {};
      localStorage.removeItem(STORAGE_KEY);
    },
    getLocalTaktTime: function(scanInfo, prodShiftOrder, hourlyQuantityIndex)
    {
      var quantityDone = 1;
      var hourlyQuantityDone = 1;
      var currentScannedAt = scanInfo.scannedAt.getTime();
      var previousScannedAt = new Date(prodShiftOrder.get('startedAt')).getTime();
      var currentHour = new Date().getHours();
      var prodLine = prodShiftOrder.get('prodLine');

      Object.keys(snBuffer).forEach(function(sn)
      {
        var d = snBuffer[sn];

        if (d[1] === prodShiftOrder.id)
        {
          quantityDone += 1;
          previousScannedAt = d[0];
        }

        if (d[2] === prodLine && new Date(d[0]).getHours() === currentHour)
        {
          hourlyQuantityDone += 1;
        }
      });

      var lastTaktTime = currentScannedAt - previousScannedAt;

      return {
        result: 'SUCCESS',
        serialNumber: _.assign({
          taktTime: lastTaktTime,
          prodShiftOrder: prodShiftOrder.id,
          prodLine: prodLine
        }, scanInfo),
        quantityDone: quantityDone,
        lastTaktTime: lastTaktTime,
        avgTaktTime: 0,
        hourlyQuantityDone: {
          index: hourlyQuantityIndex,
          value: hourlyQuantityDone
        }
      };
    }
  };
});
