// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/wh/WhOrder',
  'app/wh/templates/pickup/status'
], function(
  View,
  WhOrder,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    initialize: function()
    {
      this.oldPadding = null;

      this.listenTo(this.model, 'change:funcs', this.update);
    },

    getTemplateData: function()
    {
      return {
        funcs: this.model.get('funcs')
      };
    },

    destroy: function()
    {
      if (this.oldPadding !== null)
      {
        document.body.style.paddingBottom = this.oldPadding;
      }
    },

    beforeRender: function()
    {
      if (this.oldPadding === null)
      {
        this.oldPadding = document.body.style.paddingBottom;
      }
    },

    afterRender: function()
    {
      document.body.style.paddingBottom = this.$el.outerHeight() + 'px';
    },

    update: function()
    {
      var funcs = this.model.get('funcs');

      this.$('.wh-pickup-status-func').each(function()
      {
        this.classList.toggle('is-ready', funcs[this.dataset.func]);
      });
    }

  });
});
