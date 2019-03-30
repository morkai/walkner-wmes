// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/viewport',
  'app/core/View',
  'app/snf-programs/templates/image',
  'jquery.kinetic'
], function(
  _,
  $,
  viewport,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    dialogClassName: 'snf-programs-image-dialog',

    events: {
      'dblclick': function()
      {
        viewport.closeDialog();
      }
    },

    initialize: function()
    {
      this.onResize = _.debounce(this.resize.bind(this), 25);

      $(window).on('resize', this.onResize);
    },

    destroy: function()
    {
      $(window).off('resize', this.onResize);
    },

    getTemplateData: function()
    {
      return {
        programId: this.model.programId,
        image: this.model.image
      };
    },

    afterRender: function()
    {
      this.resize();
      this.$el.kinetic();
    },

    resize: function()
    {
      this.$el.css({
        maxWidth: (window.innerWidth - 90) + 'px',
        maxHeight: (window.innerHeight - 90) + 'px'
      });
    }

  });
});
