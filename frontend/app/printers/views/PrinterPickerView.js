// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/broker',
  'app/pubsub',
  'app/viewport',
  'app/core/View',
  'app/planning/util/contextMenu',
  'app/printers/templates/pageAction'
], function(
  _,
  $,
  t,
  broker,
  pubsub,
  viewport,
  View,
  contextMenu,
  pageActionTemplate
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

  }, {

    contextMenu: function(e, done)
    {
      e.contextMenu.hide = false;

      var sandbox = broker.sandbox();

      sandbox.subscribe('planning.contextMenu.hidden', function()
      {
        sandbox.destroy();
        sandbox = null;

        if (e.contextMenu.onCancel)
        {
          e.contextMenu.onCancel();
        }
      });

      getPrinters(function(printers)
      {
        if (!sandbox)
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
    },

    listAction: function(e, done)
    {
      var $action = $(e.currentTarget).addClass('disabled').prop('disabled', true);

      e.contextMenu = e.listAction;
      e.contextMenu.onCancel = function() { $action.removeClass('disabled').prop('disabled', false); };

      this.contextMenu(e, function(printer)
      {
        e.contextMenu.onCancel();

        done(printer);
      });
    },

    pageAction: function(options, done)
    {
      var model = options.view.model || options.view.collection;
      var nlsDomain = model.getNlsDomain
        ? model.getNlsDomain()
        : (model.nlsDomain || 'core');
      var nlsKey = 'PAGE_ACTION:print';
      var label = options.label || (t.has(nlsDomain, nlsKey) ? t(nlsDomain, nlsKey) : t('core', nlsKey));

      if (cache === null || cache.length === 0)
      {
        return {
          label: label,
          icon: 'print',
          callback: function(e)
          {
            if (cache && cache.length === 0)
            {
              return done(null);
            }

            var $btn = $(e.currentTarget).find('.btn').addClass('disabled').prop('disabled', true);
            var $fa = $btn.find('.fa').removeClass('fa-print').addClass('fa-spinner fa-spin');
            var sandbox = options.view.broker.sandbox();

            sandbox.subscribe('router.dispatching', unlock);

            getPrinters(function(printers)
            {
              if (!sandbox)
              {
                return;
              }

              if (!printers.length)
              {
                return done(null);
              }

              viewport.currentLayout.setActions(options.view.actions, options.view);
              viewport.currentLayout.$('.page-actions-printers').find('.btn').click();
            });

            function unlock()
            {
              sandbox.destroy();
              sandbox = null;

              $fa.removeClass('fa-spinner fa-spin').addClass('fa-print');
              $btn.prop('disabled', false).removeClass('disabled');
            }
          }
        };
      }

      return {
        template: function()
        {
          return pageActionTemplate({
            label: label,
            printers: cache
          });
        },
        callback: function(e)
        {
          var $action = $(e.currentTarget);

          if ($action.data('printers-bound'))
          {
            return;
          }

          $action.data('printers-bound', true);
          $action.find('.dropdown-menu').on('click', 'a', function(e)
          {
            done(e.currentTarget.dataset.printerId || null);
          });
        }
      };
    }

  });
});
