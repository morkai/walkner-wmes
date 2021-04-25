// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/suggestions/templates/resolutions'
], function(
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    initialize: function()
    {
      View.prototype.initialize.call(this);

      this.once('afterRender', function()
      {
        this.listenTo(this.model, 'reset change:resolutions', this.render);
      });
    },

    getTemplateData: function()
    {
      var changes = this.model.get('observer').changes;

      return {
        changed: changes.all || changes.resolutions,
        resolutions: this.model.get('resolutions') || []
      };
    }

  });
});
