// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/wh/templates/problemFilter'
], function(
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'click #-useDarkerTheme': function()
      {
        this.displayOptions.toggleDarkerThemeUse();
      }

    },

    initialize: function()
    {
      this.listenTo(this.displayOptions, 'change:useDarkerTheme', this.updateToggles);
    },

    getTemplateData: function()
    {
      return {
        useDarkerTheme: this.displayOptions.isDarkerThemeUsed()
      };
    },

    updateToggles: function()
    {
      this.$id('useDarkerTheme').toggleClass('active', this.displayOptions.isDarkerThemeUsed());
    }

  });
});
