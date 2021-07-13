// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/broker',
  'app/viewport',
  'app/i18n',
  'app/time',
  'app/user',
  'app/data/prodLog',
  'app/data/localStorage',
  'app/production/views/BomCheckerDialogView',
  'app/production/templates/snMessage',
  'i18n!app/nls/production'
], function(
  _,
  $,
  broker,
  viewport,
  t,
  time,
  user,
  prodLog,
  localStorage,
  BomCheckerDialogView,
  snMessageTemplate
) {
  'use strict';

  var STORAGE_KEY = 'PRODUCTION:SN';
  var VIRTUAL_SN_RE = /[A-Z0-9]{4}\.000000000\.0000/;

  var handleTimeout = null;
  var scanBuffer = '';
  var snBuffer = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  var maxCheck = {
    _id: '',
    count: 0,
    time: 0
  };
  var scanInfoQueue = null;
  var extraPsn = false;

  function handleScanBuffer(buffer)
  {
    if (buffer)
    {
      scanBuffer = buffer;
    }

    buffer = scanBuffer.trim();
    scanBuffer = '';

    if (buffer === '<ESC>' || buffer === '1337000027')
    {
      return viewport.closeAllDialogs();
    }

    var matches = buffer.match(/P0*([0-9]{9})([0-9]{4})/);

    if (!matches)
    {
      matches = buffer.match(/([A-Z0-9]{4}\.([0-9]{9})\.([0-9]{4}))$/);

      if (matches && /^[A-Z0-9]+\.[0-9]+\.[0-9]+\.[A-Z0-9]+$/.test(buffer))
      {
        matches = null;
      }
    }

    if (matches)
    {
      broker.publish('production.taktTime.snScanned', {
        _id: matches[1],
        scannedAt: new Date(),
        orderNo: matches[2],
        serialNo: +matches[3]
      });
    }
    else if (buffer.length > 5)
    {
      broker.publish('production.taktTime.snScanned', {
        _id: buffer,
        scannedAt: new Date(),
        orderNo: null,
        serialNo: null
      });
    }
  }

  window.fakeSN = handleScanBuffer;

  return {
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
    },
    showMessage: function(scanInfo, severity, message, duration)
    {
      if (!this.view)
      {
        return;
      }

      if (!scanInfo)
      {
        scanInfo = {_id: ''};
      }

      var $message = $('#snMessage');

      if (!$message.length)
      {
        $message = $(snMessageTemplate()).appendTo('body');
        $message.on('click', this.hideMessage.bind(this));
      }

      var scannedValue = scanInfo._id.length > 43
        ? (scanInfo._id.substring(0, 40) + '...')
        : scanInfo._id;

      if (!duration && _.includes(['MAX_TOTAL', 'MAX_LINE'], message))
      {
        duration = 18000;
      }

      $('#snMessage-text').html(typeof message === 'function' ? message() : t('production', 'snMessage:' + message));

      var noScannedValue = scannedValue.length === 0;
      var noOrderNo = (scanInfo.orderNo || '').length === 0;
      var noSerialNo = (scanInfo.serialNo || '').length === 0;

      $message.find('.production-snMessage-props').toggleClass('hidden', noScannedValue && noOrderNo && noSerialNo);

      $('#snMessage-scannedValue')
        .text(scannedValue)
        .closest('.production-snMessage-prop')
        .toggleClass('hidden', noScannedValue);

      $('#snMessage-orderNo').text(scanInfo.orderNo || '-')
        .closest('.production-snMessage-prop')
        .toggleClass('hidden', noOrderNo);

      $('#snMessage-serialNo')
        .text(scanInfo.serialNo || '-')
        .closest('.production-snMessage-prop')
        .toggleClass('hidden', noSerialNo);

      $message
        .removeClass('hidden is-info is-success is-error is-warning')
        .addClass('is-' + severity);

      document.body.classList.add('production-snMessage-active');

      if (this.view.timers.hideSnMessage)
      {
        clearTimeout(this.view.timers.hideSnMessage);
      }

      this.view.timers.hideSnMessage = setTimeout(this.hideMessage.bind(this), duration || 6000);
    },
    hideMessage: function()
    {
      if (!this.view)
      {
        return;
      }

      if (this.view.timers.hideSnMessage)
      {
        clearTimeout(this.view.timers.hideSnMessage);
      }

      this.view.timers.hideSnMessage = null;

      $('#snMessage').addClass('hidden');

      document.body.classList.remove('production-snMessage-active');
    },
    createDynamicLogEntry: function(scanInfo)
    {
      var logEntry = {
        _id: null,
        instanceId: window.INSTANCE_ID,
        type: 'checkSerialNumber',
        data: scanInfo,
        createdAt: time.getMoment().toDate(),
        creator: user.getInfo(),
        prodLine: window.WMES_LINE_ID,
        station: window.WMES_STATION || 0
      };

      scanInfo.sapTaktTime = -1;
      scanInfo.extraPsn = extraPsn;

      return logEntry;
    },
    bind: function(view)
    {
      var snManager = this;

      if (snManager.view)
      {
        throw new Error('snManager already bound!');
      }

      snManager.view = view;

      var originalDestroy = view.destroy;

      view.destroy = function()
      {
        $(window).off('keydown', onKeyDown);

        originalDestroy.apply(view, arguments);
      };

      view.broker.subscribe('production.taktTime.snScanned', onSnScanned);

      $(window).on('keydown', onKeyDown);

      function onKeyDown(e)
      {
        var tagName = e.target.tagName;
        var formField = (tagName === 'INPUT' && e.target.type !== 'BUTTON')
          || tagName === 'SELECT'
          || tagName === 'TEXTAREA';

        if (e.keyCode === 8 && (!formField || e.target.readOnly || e.target.disabled))
        {
          e.preventDefault();
        }

        if (e.target.classList.contains('form-control')
          && e.target.dataset.snAccept === undefined)
        {
          return;
        }

        if (e.key && e.key.length === 1)
        {
          scanBuffer += e.key.toUpperCase();

          clearTimeout(handleTimeout);
          handleTimeout = setTimeout(handleScanBuffer, 50);
        }
      }

      function onSnScanned(scanInfo)
      {
        if (snManager.view && snManager.view.onSnScanned)
        {
          snManager.view.onSnScanned(scanInfo);

          return;
        }

        if (scanInfoQueue)
        {
          scanInfoQueue.push(scanInfo);

          return;
        }

        scanInfoQueue = [];

        handleNextScanInfo(scanInfo);
      }

      function handleNextScanInfo(scanInfo)
      {
        if (scanInfo)
        {
          if (viewport.currentDialog)
          {
            if (!(viewport.currentDialog instanceof BomCheckerDialogView))
            {
              return;
            }

            if (scanInfo.orderNo)
            {
              swapBomCheckerIfNeeded(scanInfo);
            }
            else
            {
              viewport.currentDialog.onSnScanned(scanInfo);

              handleNextScanInfo();
            }

            return;
          }

          if (scanInfo.orderNo)
          {
            createCheckSn(scanInfo);
          }
          else
          {
            resolveBomCheck(scanInfo);
          }

          return;
        }

        if (!scanInfoQueue)
        {
          return;
        }

        if (scanInfoQueue.length)
        {
          handleNextScanInfo(scanInfoQueue.shift());

          return;
        }

        scanInfoQueue = null;
      }

      function swapBomCheckerIfNeeded(newScanInfo)
      {
        var oldScanInfo = viewport.currentDialog.model.logEntry.data;

        if (newScanInfo._id === oldScanInfo._id)
        {
          handleNextScanInfo();

          return;
        }

        if ((newScanInfo.serialNo === 0 && /^0+$/.test(newScanInfo.orderNo))
          || newScanInfo.orderNo !== oldScanInfo.orderNo)
        {
          viewport.closeAllDialogs();

          createCheckSn(newScanInfo);
        }
        else
        {
          viewport.currentDialog.onSnScanned(newScanInfo);

          handleNextScanInfo();
        }
      }

      function resolveBomCheck(bomScanInfo)
      {
        var orderScanInfo = {
          _id: '0000.000000000.0000',
          orderNo: '000000000',
          serialNo: 0,
          scannedAt: bomScanInfo.scannedAt
        };

        createCheckSn(orderScanInfo, bomScanInfo);
      }

      function createCheckSn(scanInfo, bomScanInfo)
      {
        if (view.createCheckSn)
        {
          view.createCheckSn(scanInfo, bomScanInfo, checkSn);
        }
        else
        {
          var error = snManager.contains(scanInfo._id) ? 'ALREADY_USED' : null;

          if (error)
          {
            snManager.showMessage(scanInfo, 'error', error);
          }

          checkSn(error, snManager.createDynamicLogEntry(scanInfo), bomScanInfo);
        }
      }

      function checkSn(err, logEntry, bomScanInfo)
      {
        if (err)
        {
          handleNextScanInfo();

          return;
        }

        var model = view.model;
        var updateModel = model && model.updateTaktTime && model.updateTaktTimeLocally;

        snManager.showMessage(logEntry.data, 'warning', 'CHECKING');

        if (maxCheck._id === logEntry.data._id
          && maxCheck.count >= 2
          && logEntry.data.scannedAt - maxCheck.time < 3000)
        {
          logEntry.data.skipMaxCheck = true;
        }

        var req = view.ajax({
          method: 'POST',
          url: '/production/checkSerialNumber?bomCheck=' + (bomScanInfo ? 1 : 0),
          data: JSON.stringify(logEntry),
          timeout: 6000
        });

        req.fail(function(jqXhr)
        {
          if (jqXhr.status < 200)
          {
            if (updateModel)
            {
              model.updateTaktTimeLocally(logEntry);
            }

            snManager.showMessage(logEntry.data, 'success', 'SUCCESS');

            handleNextScanInfo();

            return;
          }

          if (updateModel && logEntry._id)
          {
            logEntry.data.error = 'SERVER_FAILURE';

            prodLog.record(model, logEntry);
          }

          snManager.showMessage(logEntry.data, 'error', 'SERVER_FAILURE');

          handleNextScanInfo();
        });

        req.done(function(res)
        {
          if (res.result === 'MAX_TOTAL' || res.result === 'MAX_LINE')
          {
            if (maxCheck._id === logEntry.data._id && logEntry.data.scannedAt - maxCheck.time < 3000)
            {
              maxCheck.count += 1;
            }
            else
            {
              maxCheck._id = logEntry.data._id;
              maxCheck.count = 1;
            }

            maxCheck.time = logEntry.data.scannedAt.getTime();
          }
          else
          {
            maxCheck._id = '';
          }

          if (res.result === 'CHECK_BOM')
          {
            showBomChecker(res, bomScanInfo);
          }
          else if (res.result === 'SUCCESS')
          {
            if (updateModel)
            {
              model.updateTaktTime(res);
            }

            snManager.showMessage(res.serialNumber, 'success', 'SUCCESS');

            handleNextScanInfo();
          }
          else
          {
            if (res.result === 'ALREADY_USED')
            {
              snManager.add(res.serialNumber);
            }

            if (updateModel && logEntry._id)
            {
              logEntry.data.error = res.result;

              prodLog.record(model, logEntry);
            }

            snManager.showMessage(logEntry.data, 'error', res.result);

            handleNextScanInfo();
          }
        });
      }

      function showBomChecker(model, bomScanInfo)
      {
        snManager.hideMessage();

        if (bomScanInfo)
        {
          model.logEntry.data._id = '0000.000000000.0000';
          model.logEntry.data.serialNo = 0;
        }

        var nextHandled = false;
        var dialogView = new BomCheckerDialogView({
          model: model,
          snMessage: {
            show: snManager.showMessage.bind(snManager),
            hide: snManager.hideMessage.bind(snManager)
          }
        });

        view.listenToOnce(dialogView, 'dialog:hidden', function()
        {
          if (!nextHandled)
          {
            nextHandled = true;
            handleNextScanInfo();
          }
        });

        view.listenToOnce(dialogView, 'dialog:shown', function()
        {
          if (bomScanInfo)
          {
            dialogView.onSnScanned(bomScanInfo);
          }

          if (!nextHandled)
          {
            nextHandled = true;
            handleNextScanInfo();
          }
        });

        view.listenToOnce(dialogView, 'checked', function(logEntry)
        {
          nextHandled = true;

          viewport.closeAllDialogs();

          checkSn(null, logEntry);
        });

        viewport.showDialog(dialogView, t('production', 'bomChecker:title'));
      }
    },
    isExtraPsnEnabled: function()
    {
      return extraPsn;
    },
    toggleExtraPsn: function()
    {
      extraPsn = !extraPsn;
    }
  };
});
