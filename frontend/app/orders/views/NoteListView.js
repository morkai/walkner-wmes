// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/core/View',
  './NotesEditFormView',
  'app/orders/templates/noteList'
], function(
  viewport,
  View,
  NotesEditFormView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    remoteTopics: {
      'orders.productNodes.**': 'render'
    },

    events: {
      'click #-edit': function()
      {
        var dialogView = new NotesEditFormView({
          model: this.model
        });

        viewport.showDialog(dialogView, this.t('notes:edit:title'));
      }
    },

    initialize: function()
    {
      this.once('afterRender', function()
      {
        this.listenTo(this.model, 'change:notes', this.render);
      });
    },

    getTemplateData: function()
    {
      return {
        notes: this.model.get('notes')
      };
    }

  });
});
