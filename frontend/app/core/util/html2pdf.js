// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/viewport'
], function(
  $,
  t,
  viewport
) {
  'use strict';

  return function html2pdf(html, windowOptions, printer)
  {
    if (typeof windowOptions === 'string')
    {
      printer = windowOptions;
      windowOptions = null;
    }

    var msg = viewport.msg.show({
      type: 'info',
      text: '<i class="fa fa-spinner fa-spin"></i><span>' + t('core', 'html2pdf:progress') + '</span>'
    });

    var req = $.ajax({
      method: 'POST',
      url: '/html2pdf',
      contentType: 'text/plain',
      data: html
    });

    req.done(function(res)
    {
      if (typeof printer === 'string' && /^[a-f0-9]{24}$/.test(printer))
      {
        printInPrinter(msg, printer, res.hash);
      }
      else
      {
        printInBrowser(msg, windowOptions, res.hash);
      }
    });

    req.fail(function()
    {
      viewport.msg.hide(msg, true);
      viewport.msg.show({
        type: 'error',
        time: 2500,
        text: t('core', 'html2pdf:failure')
      });
    });
  };

  function printInBrowser(msg, windowOptions, hash)
  {
    if (!windowOptions)
    {
      var width = Math.min(window.screen.availWidth - 200, 1400);

      windowOptions = {
        top: 80,
        width: width,
        height: Math.min(window.screen.availHeight - 160, 800),
        left: window.screen.availWidth - width - 80
      };
    }

    var features = [];

    Object.keys(windowOptions).forEach(function(k)
    {
      features.push(k + '=' + windowOptions[k]);
    });

    var win = window.open('/html2pdf/' + hash + '.pdf', '_blank', features.join(','));

    if (!win)
    {
      viewport.msg.hide(msg, true);
      viewport.msg.show({
        type: 'error',
        time: 3000,
        text: t('core', 'MSG:POPUP_BLOCKED')
      });
    }
    else
    {
      viewport.msg.hide(msg);

      win.focus();
    }
  }

  function printInPrinter(msg, printer, hash)
  {
    viewport.msg.hide(msg);

    msg = viewport.msg.show({
      type: 'info',
      text: '<i class="fa fa-spinner fa-spin"></i><span>' + t('core', 'html2pdf:printing') + '</span>'
    });

    var req = $.ajax({
      method: 'POST',
      url: '/html2pdf;print',
      data: JSON.stringify({
        hash: hash,
        printer: printer
      })
    });

    req.done(function()
    {
      viewport.msg.hide(msg, true);
      viewport.msg.show({
        type: 'success',
        time: 2000,
        text: t('core', 'html2pdf:printing:success')
      });
    });

    req.fail(function()
    {
      viewport.msg.hide(msg, true);
      viewport.msg.show({
        type: 'error',
        time: 2500,
        text: t('core', 'html2pdf:printing:failure')
      });
    });
  }
});
