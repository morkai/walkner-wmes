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
      var targets = [];

      (this.model.get('notes') || []).forEach(function(note)
      {
        if (targets.length === 0 || targets[targets.length - 1]._id !== note.target)
        {
          targets.push({
            _id: note.target,
            notes: []
          });
        }

        targets[targets.length - 1].notes.push(note);
      });

      return {
        targets: targets
      };
    }

  });
});
