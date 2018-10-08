// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/broker',
  'app/viewport'
], function(
  _,
  broker,
  viewport
) {
  'use strict';

  var STORAGE_KEY = 'PRODUCTION:SN';
  var VIRTUAL_SN_RE = /[A-Z0-9]{4}\.000000000\.0000/;

  var handleTimeout = null;
  var scanBuffer = '';
  var snBuffer = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

  function handleScanBuffer(buffer)
  {
    if (buffer)
    {
      scanBuffer = buffer;
    }

    var matches = null;

    if (!viewport.currentDialog || viewport.currentDialog.snManagerMode !== 'bom')
    {
      matches = scanBuffer.match(/P0*([0-9]{9})([0-9]{4})/);

      if (!matches)
      {
        matches = scanBuffer.match(/[A-Z0-9]{4}\.([0-9]+)\.([0-9]+)/);
      }
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

  window.fakeSN = handleScanBuffer;

  return {
    handleKeyboardEvent: function(e)
    {
      if (e.target.classList.contains('form-control')
        && e.target.dataset.snAccept === undefined)
      {
        return;
      }

      if (e.key && e.key.length === 1)
      {
        scanBuffer += e.key;

        clearTimeout(handleTimeout);
        handleTimeout = setTimeout(handleScanBuffer, 50);
      }
    },
    contains: function(sn)
    {
      return !VIRTUAL_SN_RE.test(sn) && !!snBuffer[sn];
    },
    add: function(sn)
    {
      if (VIRTUAL_SN_RE.test(sn))
      {
        return;
      }

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
