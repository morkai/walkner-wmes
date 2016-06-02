// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/core/View',
  'app/qiResults/templates/print'
], function(
  $,
  t,
  View,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'blank',

    template: template,

    initialize: function()
    {
      this.$style = null;
    },

    load: function(when)
    {
      return when(this.model.fetch());
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        model: this.model.toJSON()
      };
    },

    afterRender: function()
    {
      if (!this.$style)
      {
        this.$style = $('<style>@page{size:landscape}#app-loading,.message{display:none}</style>').appendTo('head');
      }

      var parent = this.el;

      while ((parent = parent.parentElement) !== null)
      {
        parent.style.height = '100%';
      }

      this.el.style.height = '100%';

      document.title = t('qiResults', 'print:title', {
        rid: this.model.get('rid')
      });

      var imgLoadCounter = 0;
      var $img = this.$('img');

      if (!$img.length)
      {
        setTimeout(window.print.bind(window), 1);
      }

      $img.on('load', function()
      {
        if (++imgLoadCounter === $img.length)
        {
          setTimeout(window.print.bind(window), 1);
        }
      });
    },

    destroy: function()
    {
      if (this.$style)
      {
        this.$style.remove();
        this.$style = null;
      }

      var parent = this.el;

      while ((parent = parent.parentElement) !== null)
      {
        parent.style.height = '';
      }
    }

  });
});
