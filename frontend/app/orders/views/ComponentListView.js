// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/orders/templates/componentList'
], function(
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click .orders-bom-item': function(e)
      {
        this.item = e.currentTarget.textContent.trim();

        if (this.contents === null)
        {
          this.loadContents();
        }
        else if (this.document === null)
        {
          this.trigger('bestDocumentRequested', this.item, this.contents);
        }
        else
        {
          this.mark();
        }

        return false;
      }
    },

    initialize: function()
    {
      this.item = null;
      this.document = null;
      this.contents = null;
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        paint: !!this.options.paint,
        bom: this.model.get('bom').toJSON()
      };
    },

    beforeRender: function()
    {
      this.stopListening(this.model, 'change:bom', this.render);
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'change:bom', this.render);

      this.$el.toggleClass('hidden', this.model.get('bom').length === 0);

      this.updateItems();
    },

    markDocument: function(nc15, win)
    {
      this.document = nc15;
      this.window = win;

      if (this.contents === null)
      {
        this.loadContents();
      }
      else
      {
        this.updateItems();
      }
    },

    unmarkDocument: function()
    {
      this.document = null;
      this.window = null;

      this.updateItems();
    },

    loadContents: function()
    {
      var view = this;

      if (view.loadContentsReq)
      {
        return;
      }

      view.loadContentsReq = view.ajax({url: '/orders/' + view.model.id + '/documentContents'});

      view.loadContentsReq.always(function()
      {
        view.loadContentsReq = null;
      });

      view.loadContentsReq.done(function(res)
      {
        view.contents = res;

        if (view.document === null)
        {
          view.trigger('bestDocumentRequested', view.item, res);
        }
        else
        {
          view.updateItems();
        }
      });
    },

    updateItems: function()
    {
      var view = this;

      if (!view.contents)
      {
        return;
      }

      view.$('.orders-bom-item').each(function()
      {
        var html = this.textContent.trim();

        if (view.contents[html] && view.contents[html][view.document])
        {
          html = '<a>' + html + '</a>';
        }

        this.innerHTML = html;
      });

      this.mark();
    },

    mark: function()
    {
      if (this.window)
      {
        this.window.focus();
      }

      if (!this.item
        || !this.document
        || !this.contents
        || !this.contents[this.item])
      {
        return;
      }

      this.window.showMarks(this.contents[this.item][this.document] || []);
    }

  });
});
