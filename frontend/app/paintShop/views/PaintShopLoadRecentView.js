// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/core/View',
  'app/paintShop/templates/load/recent'
], function(
  _,
  $,
  t,
  time,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    initialize: function()
    {
      var view = this;

      view.colorCache = {};

      view.listenTo(view.settings, 'change', function()
      {
        if (view.isRendered())
        {
          view.colorCache = {};
          view.render();
        }
      });

      view.listenTo(view.recent, 'change', function()
      {
        if (view.isRendered())
        {
          view.render();
        }
      });

      view.listenTo(view.recent, 'update', this.update);

      $(window).on('resize', view.resize.bind(view));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
    },

    afterRender: function()
    {
      this.resize();
    },

    resize: function()
    {
      if (this.options.embedded)
      {
        this.el.parentNode.style.width = window.innerWidth + 'px';
      }

      this.el.scrollLeft = 2560;
    },

    update: function(e)
    {
      var view = this;

      for (var i = 0; i < e.removed; ++i)
      {
        view.el.removeChild(view.el.firstElementChild);
      }

      var html = e.added.map(function(d)
      {
        var item = view.serializeItem(d);

        return '<div class="paintShopLoad-recent-item"'
          + ' style="border-top-width: ' + item.padding + 'px; background: ' + item.color + '"></div>';
      });

      view.$el.append(html.join(''));

      view.resize();
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        items: this.recent.get('collection').map(this.serializeItem, this)
      };
    },

    serializeItem: function(d)
    {
      var color = this.colorCache[d];

      if (!color)
      {
        color = this.colorCache[d] = this.settings.getLoadStatus(d).color;
      }

      return {
        padding: 174 - d * 3,
        duration: d,
        color: color
      };
    }

  });
});
