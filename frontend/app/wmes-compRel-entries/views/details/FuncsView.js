// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/viewport',
  'app/core/View',
  './AcceptView',
  'app/wmes-compRel-entries/templates/details/funcs'
], function(
  $,
  viewport,
  View,
  AcceptView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'click .compRel-details-accept': function(e)
      {
        this.showAcceptDialog(this.$(e.target).closest('.compRel-details-func')[0].dataset.id);
      }

    },

    initialize: function()
    {
      this.once('afterRender', function()
      {
        this.listenTo(this.model, 'change:funcs', this.render);
      });

      $(window).on('resize.' + this.idPrefix, this.onWindowResize.bind(this));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
    },

    getTemplateData: function()
    {
      return {
        funcs: this.model.serializeFuncs()
      };
    },

    afterRender: function()
    {
      this.toggleOverflowX();
    },

    showAcceptDialog: function(funcId)
    {
      var dialogView = new AcceptView({
        model: {
          entry: this.model,
          func: this.model.getFunc(funcId)
        }
      });

      viewport.showDialog(dialogView, this.t('accept:title'));
    },

    toggleOverflowX: function()
    {
      this.$('.compRel-details-funcs').css(
        'overflow-x',
        (this.$el.outerWidth() + 50) < window.innerWidth ? 'visible' : ''
      );
    },

    onWindowResize: function()
    {
      this.toggleOverflowX();
    }

  });
});
