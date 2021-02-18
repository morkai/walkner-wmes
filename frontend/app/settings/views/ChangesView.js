// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/settings/templates/changes'
], function(
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    initialize: function()
    {
      this.loaded = false;

      this.listenTo(this.collection, 'reset', this.render);
    },

    getTemplateData: function()
    {
      return {
        loaded: this.loaded,
        changes: this.collection.toJSON()
      };
    },

    afterRender: function()
    {
      if (!this.loaded)
      {
        this.load();
      }
    },

    load: function()
    {
      var view = this;
      var req = view.collection.fetch({reset: true});

      view.loaded = true;

      req.fail(function()
      {
        view.loaded = false;

        view.find('.fa-spin').removeClass('fa-spin');
      });
    }

  });
});
