// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
  var printJob = null;
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

  qzPrint.isPrinting = function()
  {
    return printJob !== null;
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
    /* eslint-disable camelcase */
    var parameters = {
      jnlp_href: '/vendor/qz-print/qz-print_jnlp.jnlp',
      cache_option: 'plugin',
      disable_logging: 'false',
      initial_focus: 'false'
    };
    /* eslint-enable camelcase */

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
      return done(new Error('PLUGIN_NOT_LOADED'));
    }

    var timeout = setTimeout(function()
    {
      window.qzDoneFinding = null;

      return done(new Error('FIND_PRINT_TIMEOUT'));
    }, TIMEOUT);

    window.qzDoneFinding = function()
    {
      clearTimeout(timeout);

      window.qzDoneFinding = null;

      var foundPrinterName = qz.getPrinter();

      if (foundPrinterName === null)
      {
        return done(new Error('PRINTER_NOT_FOUND'));
      }

      return done(null, foundPrinterName);
    };

    qz.findPrinter(requestedPrinterName);
  };

  qzPrint.findPrinters = function(done)
  {
    if (!this.isLoaded())
    {
      return done(new Error('PLUGIN_NOT_LOADED'));
    }

    var timeout = setTimeout(function()
    {
      window.qzDoneFinding = null;

      return done(new Error('FIND_PRINTERS_TIMEOUT'));
    }, TIMEOUT);

    window.qzDoneFinding = function()
    {
      clearTimeout(timeout);

      window.qzDoneFinding = null;

      return done(null, qz.getPrinters().split(',').filter(function(printerName) { return printerName.length; }));
    };

    qz.findPrinter('\\{dummy_printer\\}');
  };

  qzPrint.printRaw = function(printerName, data, done)
  {
    if (!this.isLoaded())
    {
      return done(new Error('PLUGIN_NOT_LOADED'));
    }

    printQueue.push({
      type: 'raw',
      printerName: printerName,
      done: function(err)
      {
        printJob = null;

        done(err);
      },
      append: function(done)
      {
        qz.append(data);

        done();
      },
      print: function()
      {
        qz.print();
      }
    });

    printNext();
  };

  qzPrint.printPdf = function(printerName, pdfFile, paperOptions, done)
  {
    if (!this.isLoaded())
    {
      return done(new Error('PLUGIN_NOT_LOADED'));
    }

    printQueue.push({
      type: 'pdf',
      printerName: printerName,
      done: function(err)
      {
        printJob = null;

        done(err);
      },
      append: function(done)
      {
        qz.setPaperSize(paperOptions.width, paperOptions.height, 'mm');
        qz.setOrientation(paperOptions.orientation);
        qz.setAutoSize(true);
        qz.appendPDF(pdfFile);

        window.qzDoneAppending = function()
        {
          window.qzDoneAppending = null;

          done();
        };
      },
      print: function()
      {
        qz.printPS();
      }
    });

    printNext();
  };

  function printNext()
  {
    if (printJob !== null || !printQueue.length)
    {
      return;
    }

    printJob = printQueue.shift();

    qzPrint.findPrinter(printJob.printerName, function(err)
    {
      if (err)
      {
        return printJob.done(err);
      }

      printJob.append(printJob.print);
    });
  }

  function showInitWarning()
  {
    $('body').prepend(qzPrintInitWarningTemplate());
  }

  function hideInitWarning()
  {
    $('#qzPrintInitWarning').remove();
  }

  window.qzReady = function()
  {
    qz = document.getElementById('qz');

    try
    {
      qz.getVersion();

      hideInitWarning();
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
      err = new Error(err.getLocalizedMessage());

      qz.clearException();

      printJob.done(err);
    }
    else if (printJob !== null)
    {
      console.log('Printing done!', printJob);

      printJob.done();
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
