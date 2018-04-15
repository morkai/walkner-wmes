// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/broker',
  'app/pubsub',
  'app/core/View',
  'app/planning/util/contextMenu',
  'app/printers/templates/form'
], function(
  _,
  $,
  t,
  broker,
  pubsub,
  View,
  contextMenu,
  template
) {
  'use strict';

  var cache = null;

  function getPrinters(done)
  {
    if (cache === null)
    {
      loadPrinters(done);
    }
    else
    {
      setTimeout(done, 1, cache);
    }
  }

  function loadPrinters(done)
  {
    var req = $.ajax({url: '/printing/printers'});

    pubsub.subscribe('printing.printers.**', function(message, topic)
    {
      if (cache === null)
      {
        return;
      }

      switch (topic)
      {
        case 'printing.printers.added':
          cache.push(message.model);

          sortPrinters();
          break;

        case 'printing.printers.deleted':
          cache = cache.filter(function(printer) { return printer._id !== message.model._id; });
          break;

        case 'printing.printers.edited':
          var printer = _.find(cache, function(printer) { return printer._id === message.model._id; });

          if (printer)
          {
            _.assign(printer, message.model);
          }
          else
          {
            cache.push(message.model);
          }

          sortPrinters();
          break;
      }
    });

    req.fail(function()
    {
      done([]);
    });

    req.done(function(res)
    {
      cache = res.collection || [];

      done(cache);
    });
  }

  function sortPrinters()
  {
    cache.sort(function(a, b)
    {
      return a.label.localeCompare(b.label);
    });
  }

  return View.extend({

    template: template,

    afterRender: function()
    {

    }

  }, {

    contextMenu: function(e, done)
    {
      e.contextMenu.hide = false;

      var sandbox = broker.sandbox();
      var cancelled = false;

      sandbox.subscribe('planning.contextMenu.hidden', function() { cancelled = true; });

      getPrinters(function(printers)
      {
        sandbox.destroy();

        if (cancelled)
        {
          return;
        }

        if (!printers.length)
        {
          return done(null);
        }

        var menu = [
          t('printers', 'menu:header'),
          {
            label: t('printers', 'menu:browser'),
            handler: done.bind(null, null)
          }
        ].concat(printers.map(function(printer)
        {
          return {
            label: printer.label,
            handler: done.bind(null, printer._id)
          };
        }));

        contextMenu.show(e.contextMenu.view, e.pageY - (5 + 23 + 24 / 2), e.pageX - 15, menu);
      });
    }

  });
});
