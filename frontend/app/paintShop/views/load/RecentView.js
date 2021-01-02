// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/core/View',
  'app/core/util/embedded',
  'app/paintShop/templates/load/recent'
], function(
  _,
  $,
  t,
  time,
  View,
  embedded,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    initialize: function()
    {
      var view = this;

      view.maxDuration = -1;
      view.colorCache = {};

      view.once('afterRender', function()
      {
        view.listenTo(view.settings, 'change', function()
        {
          view.reset();
          view.render();
        });
        view.listenTo(view.recent, 'change', view.render);
        view.listenTo(view.recent, 'update', view.update);

        $(window).on('resize', view.resize.bind(view));
      });
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
    },

    afterRender: function()
    {
      this.resize();

      if (!embedded.isEnabled())
      {
        this.$el.tooltip({
          selector: '.psLoad-recent-item',
          animation: false,
          title: function()
          {
            return time.toString(+this.dataset.d, false, false);
          }
        });
      }
    },

    reset: function()
    {
      this.maxDuration = ([].concat(this.settings.getValue('load.statuses'))
        .sort(function(a, b) { return b.from - a.from; })[0] || {from: 100}).from;

      this.colorCache = {};
    },

    resize: function()
    {
      if (embedded.isEnabled() && this.el.parentNode)
      {
        this.el.parentNode.style.width = window.innerWidth + 'px';
      }

      this.el.scrollLeft = 9999;
    },

    update: function(e)
    {
      var view = this;

      for (var i = 0; i < e.removed; ++i)
      {
        if (view.el.firstElementChild)
        {
          view.el.removeChild(view.el.firstElementChild);
        }
      }

      var html = e.added.map(function(d)
      {
        var item = view.serializeItem(d);

        return '<div class="psLoad-recent-item"'
          + ' data-d="' + d + '"'
          + ' style="border-top-width: ' + item.padding + 'px; background: ' + item.color + '"></div>';
      });

      view.$el.append(html.join(''));

      view.resize();
    },

    getTemplateData: function()
    {
      if (this.maxDuration === -1)
      {
        this.reset();
      }

      return {
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

      var padding = 0;

      if (d < this.maxDuration)
      {
        padding = 174 - 174 * (d / this.maxDuration);
      }

      return {
        padding: Math.round(padding),
        duration: d,
        color: color
      };
    }

  });
});
