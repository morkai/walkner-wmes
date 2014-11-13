// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'jquery',
  'deployJava',
  'app/broker',
  'app/purchaseOrders/templates/qzPrintInitWarning'
], function(
  $,
  deployJava,
  broker,
  qzPrintInitWarningTemplate
) {
  'use strict';

  var TIMEOUT = 5000;

  var qz = null;
  var printQueue = [];
  var qzPrint = {};

  qzPrint.isLoaded = function()
  {
    if (qz === null)
    {
      return false;
    }

    try
    {
      if (!qz.isActive())
      {
        return false;
      }
    }
    catch (err)
    {
      console.error(err);

      return false;
    }

    return true;
  };

  qzPrint.load = function()
  {
    var attributes = {
      id: 'qz',
      code: 'qz.PrintApplet.class',
      archive: 'qz-print.jar',
      width: 1,
      height: 1
    };
    var parameters = {
      jnlp_href: '/vendor/qz-print/qz-print_jnlp.jnlp',
      cache_option: 'plugin',
      disable_logging: 'false',
      initial_focus: 'false'
    };

    if (!deployJava.versionCheck('1.7+')
      && !deployJava.versionCheck('1.6.0_45+')
      && deployJava.versionCheck('1.6+'))
    {
      delete parameters.jnlp_href;
    }

    deployJava.runApplet(attributes, parameters, '1.5');
  };

  qzPrint.findPrinter = function(requestedPrinterName, done)
  {
    if (!this.isLoaded())
    {
      return done(new Error('NOT_LOADED'));
    }

    var timeout = setTimeout(function()
    {
      window.qzDoneFinding = null;

      return done(new Error('TIMEOUT'));
    }, TIMEOUT);

    window.qzDoneFinding = function()
    {
      clearTimeout(timeout);

      window.qzDoneFinding = null;

      var foundPrinterName = qz.getPrinter();

      if (foundPrinterName === null)
      {
        return done(new Error('NOT_FOUND'));
      }

      return done(null, foundPrinterName);
    };

    qz.findPrinter(requestedPrinterName);
  };

  qzPrint.findPrinters = function(done)
  {
    if (!this.isLoaded())
    {
      return done(new Error('NOT_LOADED'));
    }

    var timeout = setTimeout(function()
    {
      window.qzDoneFinding = null;

      return done(new Error('TIMEOUT'));
    }, TIMEOUT);

    window.qzDoneFinding = function()
    {
      clearTimeout(timeout);

      window.qzDoneFinding = null;

      return done(null, qz.getPrinters().split(',').filter(function(printerName) { return !!printerName; }));
    };

    qz.findPrinter('\\{bogus_printer\\}');
  };

  qzPrint.rawPrint = function(printerName, data, done)
  {
    if (!this.isLoaded())
    {
      return done(new Error('NOT_LOADED'));
    }

    printQueue.push({
      printerName: printerName,
      data: data,
      done: done
    });

    printNext();
  };

  function printNext()
  {

  }

  function showInitWarning()
  {
    $('body').prepend(qzPrintInitWarningTemplate());
  }

  window.qzReady = function()
  {
    qz = document.getElementById('qz');

    try
    {
      qz.getVersion();
    }
    catch (err)
    {
      qz = null;

      showInitWarning();
    }
  };

  window.qzDonePrinting = function()
  {
    var err = qz.getException();

    if (err)
    {
      console.error(err.getLocalizedMessage());

      qz.clearException();
    }
    else
    {
      console.log("Printing done!");
    }
  };

  broker.subscribe('router.executing').setLimit(1).on('message', function()
  {
    if (document.getElementById('qzPrintInitWarning'))
    {
      return;
    }

    window.qzReady();
  });

  window.qzPrint = qzPrint;

  return qzPrint;
});
