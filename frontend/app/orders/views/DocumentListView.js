// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/core/View',
  'app/orders/templates/documentList'
], function(
  user,
  View,
  template
) {
  'use strict';

  var ORDER_DOCUMENT_PREVIEW_NC15 = null;
  var ORDER_DOCUMENT_PREVIEW_WINDOW = null;

  return View.extend({

    template: template,

    events: {
      'click a': function(e)
      {
        e.preventDefault();

        var view = this;
        var aEl = e.currentTarget;

        if (aEl.dataset.checking)
        {
          return false;
        }

        var nc15 = e.currentTarget.textContent.trim();

        if (nc15 === ORDER_DOCUMENT_PREVIEW_NC15
          && ORDER_DOCUMENT_PREVIEW_WINDOW
          && !ORDER_DOCUMENT_PREVIEW_WINDOW.closed)
        {
          ORDER_DOCUMENT_PREVIEW_WINDOW.focus();

          return false;
        }

        if (!aEl.dataset.checked)
        {
          view.tryOpenDocument(aEl);

          return false;
        }

        view.openDocumentWindow(aEl);

        return false;
      }
    },

    destroy: function()
    {
      ORDER_DOCUMENT_PREVIEW_NC15 = null;
      ORDER_DOCUMENT_PREVIEW_WINDOW = null;
    },

    getTemplateData: function()
    {
      return {
        orderNo: this.model.id,
        documents: this.model.get('documents').toJSON(),
        canView: !window.IS_EMBEDDED && user.isAllowedTo('LOCAL', 'DOCUMENTS:VIEW')
      };
    },

    beforeRender: function()
    {
      this.stopListening(this.model, 'change:documents', this.render);
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'change:documents', this.render);
    },

    tryOpenDocument: function(aEl)
    {
      var view = this;

      aEl.dataset.checking = 1;

      view.ajax({method: 'HEAD', url: aEl.href})
        .fail(function()
        {
          aEl.parentElement.textContent = aEl.textContent;
        })
        .done(function()
        {
          view.openDocumentWindow(aEl);
        })
        .always(function()
        {
          aEl.dataset.checking = '';
          aEl.dataset.checked = 1;
        });
    },

    openDocumentWindow: function(aEl)
    {
      var view = this;
      var ready = false;
      var nc15 = aEl.textContent.trim();
      var screen = window.screen;
      var width = screen.availWidth * 0.8;
      var height = screen.availHeight * 0.9;
      var left = Math.floor((screen.availWidth - width) / 2);
      var top = Math.floor((screen.availHeight - height) / 2);
      var windowFeatures = 'resizable,scrollbars,location=no'
        + ',top=' + top
        + ',left=' + left
        + ',width=' + Math.floor(width)
        + ',height=' + Math.floor(height);
      var windowName = 'WMES_ORDER_DOCUMENT_PREVIEW';
      var win = window.open(aEl.href, windowName, windowFeatures);

      if (!win)
      {
        return;
      }

      ORDER_DOCUMENT_PREVIEW_NC15 = nc15;
      ORDER_DOCUMENT_PREVIEW_WINDOW = win;

      clearInterval(view.timers[windowName]);

      view.timers[windowName] = setInterval(function()
      {
        if (win.closed)
        {
          ORDER_DOCUMENT_PREVIEW_NC15 = null;
          ORDER_DOCUMENT_PREVIEW_WINDOW = null;

          view.trigger('documentClosed', nc15);

          clearInterval(view.timers[windowName]);
        }
        else if (!ready && win.ready)
        {
          ready = true;

          view.trigger('documentOpened', nc15, win);

          win.focus();
        }
      }, 250);
    },

    openBestDocument: function(requestedItem, contents)
    {
      var stats = {};

      this.model.get('bom').forEach(function(component)
      {
        var item = component.get('item');

        if (!contents[item])
        {
          return;
        }

        Object.keys(contents[item]).forEach(function(nc15)
        {
          if (!stats[nc15])
          {
            stats[nc15] = item === requestedItem ? 1000 : 0;
          }

          stats[nc15] += 1;
        });
      });

      var bestCount = 0;
      var bestNc15 = null;

      Object.keys(stats).forEach(function(nc15)
      {
        var count = stats[nc15];

        if (count > bestCount)
        {
          bestCount = count;
          bestNc15 = nc15;
        }
      });

      this.$('tr[data-nc15="' + bestNc15 + '"]').find('a').click();
    }

  });
});
