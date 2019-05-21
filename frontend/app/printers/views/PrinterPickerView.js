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

  function getPrinters(tag, done)
  {
    if (cache === null)
    {
      loadPrinters(tag, done);
    }
    else
    {
      setTimeout(done, 1, filterPrinters(tag));
    }
  }

  function filterPrinters(tag)
  {
    if (!tag || !cache)
    {
      return cache || [];
    }

    return cache.filter(function(printer)
    {
      return _.isEmpty(printer.tags) || _.includes(printer.tags, tag);
    });
  }

  function loadPrinters(tag, done)
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

      done(filterPrinters(tag));
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

      getPrinters(e.contextMenu.tag, function(printers)
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
      var printers = filterPrinters(options.tag);

      if (printers.length === 0)
      {
        return {
          label: label,
          icon: 'print',
          privileges: 'USER',
          callback: function(e)
          {
            if (cache && filterPrinters(options.tag).length === 0)
            {
              return done(null);
            }

            var $btn = $(e.currentTarget).find('.btn').addClass('disabled').prop('disabled', true);
            var $fa = $btn.find('.fa').removeClass('fa-print').addClass('fa-spinner fa-spin');
            var sandbox = options.view.broker.sandbox();

            sandbox.subscribe('html2pdf.completed', unlock);

            getPrinters(options.tag, function(printers)
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
            printers: printers
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
    },

    selectField: function(view, options)
    {
      options = _.assign({id: 'printer', label: t('printers', 'select:label')}, options);

      var $formGroup = view.$id(options.id || 'printer');

      if (!$formGroup.length)
      {
        var $formActions = view.$('.form-actions');

        if (!$formActions.length)
        {
          return;
        }

        $formGroup = $('<div></div>').insertBefore($formActions);
      }

      $formGroup.prop('id', '').addClass('form-group');

      $formGroup.append('<label for="' + view.idPrefix + '-' + options.id + '">' + options.label + '</label>');

      $formGroup.append(
        '<input class="form-control" value="" readonly'
        + ' id="' + view.idPrefix + '-' + options.id + '"'
        + ' placeholder="' + t('printers', 'select:browser') + '"'
        + '>'
      );

      var filteredPrinters = filterPrinters(options.tag);

      if (cache && filteredPrinters.length === 0)
      {
        $formGroup.remove();

        return;
      }

      if (cache === null)
      {
        getPrinters(options.tag, function(printers)
        {
          var $input = view.$id(options.id);

          if ($input.length === 0)
          {
            return;
          }

          if (printers.length === 0)
          {
            $formGroup.remove();

            return;
          }

          setUpSelect2(printers);
        });
      }
      else
      {
        setUpSelect2(filteredPrinters);
      }

      function setUpSelect2(printers)
      {
        $formGroup.addClass('has-required-select2');

        view.$id(options.id)
          .removeClass('form-control')
          .prop('placeholder', t('printers', 'select:placeholder'))
          .prop('readonly', false)
          .prop('required', true)
          .select2({
            width: '100%',
            data: [{id: 'browser', text: t('printers', 'select:browser')}].concat(printers.map(function(printer)
            {
              return {
                id: printer._id,
                text: printer.label
              };
            }))
          });
      }
    }

  });
});
