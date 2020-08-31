// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/viewport',
  'app/time',
  'app/core/View',
  'app/core/util/decimalSeparator',
  'app/core/templates/userInfo',
  'app/orders/templates/componentList'
], function(
  user,
  viewport,
  time,
  View,
  decimalSeparator,
  userInfoTemplate,
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

      this.once('afterRender', function()
      {
        this.listenTo(this.model, 'change:bom change:compRels', this.onChange);
      });
    },

    getTemplateData: function()
    {
      var bom = [];
      var replacements = {};
      var colored = false;

      (this.model.get('compRels') || []).forEach(function(compRel)
      {
        compRel.oldComponents.forEach(function(oldComponent)
        {
          if (!replacements[oldComponent._id])
          {
            replacements[oldComponent._id] = [];
          }

          replacements[oldComponent._id].push(compRel);
        });
      });

      this.model.get('bom').forEach(function(component)
      {
        if (!component.get('nc12'))
        {
          return;
        }

        component = component.toJSON();

        var qty = component.qty.toString().split('.');

        component.qty = [
          qty[0].toString(),
          qty[1] ? (decimalSeparator + qty[1]) : ''
        ];

        bom.push(component);

        var compRels = replacements[component.nc12];

        if (!compRels)
        {
          return;
        }

        colored = true;
        component.replaced = true;

        compRels.forEach(function(compRel)
        {
          bom.push({
            orderNo: component.orderNo,
            mrp: component.mrp,
            nc12: compRel.newCode,
            name: compRel.newName,
            releasedAt: time.format(compRel.releasedAt, 'L HH:mm'),
            releasedBy: userInfoTemplate({userInfo: compRel.releasedBy, noIp: true})
          });
        });
      });

      return {
        colored: colored,
        empty: bom.length === 0,
        paint: !!this.options.paint,
        linkPfep: !!this.options.linkPfep && user.isAllowedTo('PFEP:VIEW'),
        bom: bom
      };
    },

    afterRender: function()
    {
      this.updateItems();
    },

    onChange: function()
    {
      var oldState = this.$el.hasClass('hidden');
      var newState = this.model.get('bom').length === 0;

      if (oldState !== newState)
      {
        this.render();
        this.model.trigger('panelToggle');
      }
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

      view.loadContentsReq = view.ajax({
        url: '/orders/' + view.model.id + '/documentContents'
      });

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

      window.showMarks(contents[item][document] || []);
    }

  });
});
