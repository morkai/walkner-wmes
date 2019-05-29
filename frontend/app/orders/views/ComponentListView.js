// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/orders/templates/componentList'
], function(
  user,
  viewport,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click .orders-bom-item': function(e)
      {
        if (!this.options.linkDocuments)
        {
          return;
        }

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
      },
      'mousedown .orders-bom-pfep': function(e)
      {
        e.preventDefault();
      },
      'mouseup .orders-bom-pfep': function(e)
      {
        viewport.msg.loading();

        var view = this;
        var nc12 = view.model.get('nc12');
        var req = view.ajax({url: '/pfep/entries?select(_id)&nc12=string:' + nc12});

        req.fail(function()
        {
          viewport.msg.loadingFailed();
        });

        req.done(function(res)
        {
          viewport.msg.loaded();

          var url;

          if (res.totalCount === 1)
          {
            url = '#pfep/entries/' + res.collection[0]._id;
          }
          else if (res.totalCount > 1)
          {
            url = '#pfep/entries?sort(-rid)&limit(15)&nc12=string:' + nc12;
          }
          else
          {
            var $td = view.$(e.target).closest('td');

            $td.html($td.text());

            return;
          }

          if (e.button === 1)
          {
            window.open(url);
          }
          else
          {
            window.location.href = url;
          }
        });

        return false;
      }
    },

    initialize: function()
    {
      this.item = null;
      this.document = null;
      this.window = null;
      this.contents = null;
    },

    getTemplateData: function()
    {
      return {
        paint: !!this.options.paint,
        linkPfep: !!this.options.linkPfep && user.isAllowedTo('PFEP:VIEW'),
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

        if (view.contents[html]
          && view.contents[html][view.document]
          && this.nextElementSibling.textContent.trim().length)
        {
          html = '<a>' + html + '</a>';
        }

        this.innerHTML = html;
      });

      this.mark();
    },

    mark: function()
    {
      var view = this;
      var window = view.window;

      if (!window || !window.showMarks)
      {
        return;
      }

      if (window)
      {
        window.focus();
      }

      var item = view.item;
      var document = view.document;
      var contents = view.contents;

      if (!item
        || !document
        || !contents
        || !contents[item])
      {
        return;
      }

      var marks = contents[item][document] || [];

      marks.sort(function(a, b)
      {
        if (a.s === b.s)
        {
          return a.p - b.p;
        }

        if (a.s === item)
        {
          return -1;
        }

        if (b.s === item)
        {
          return 1;
        }

        return 0;
      });

      window.showMarks(marks);
    }

  });
});
