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

  return View.extend({

    template: template,

    events: {
      'click a': function(e)
      {
        var aEl = e.currentTarget;

        if (aEl.dataset.checking)
        {
          return false;
        }

        var windowName = 'DOC_' + aEl.textContent.trim();

        if (!aEl.dataset.checked)
        {
          this.tryOpenDocument(aEl, windowName);

          return false;
        }

        if (e.ctrlKey)
        {
          return true;
        }

        window.open(aEl.href, 'DOC_' + windowName);

        return false;
      }
    },

    serialize: function()
    {
      return {
        orderNo: this.model.id,
        documents: this.model.get('documents').toJSON(),
        canView: user.isAllowedTo('LOCAL', 'DOCUMENTS:VIEW')
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

    tryOpenDocument: function(aEl, windowName)
    {
      aEl.dataset.checking = 1;

      this.ajax({method: 'HEAD', url: aEl.href})
        .fail(function()
        {
          aEl.parentElement.textContent = aEl.textContent;
        })
        .done(function()
        {
          window.open(aEl.href, 'DOC_' + windowName);
        })
        .always(function()
        {
          aEl.dataset.checking = '';
          aEl.dataset.checked = 1;
        });
    }

  });
});
