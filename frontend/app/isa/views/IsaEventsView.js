// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/isa/templates/eventTable',
  'app/isa/templates/eventRow'
], function(
  View,
  eventTableTemplate,
  eventRowTemplate
) {
  'use strict';

  return View.extend({

    template: eventTableTemplate,

    initialize: function()
    {
      this.listenTo(this.collection, 'reset', this.render);
      this.listenTo(this.collection, 'add', this.addRow);
      this.listenTo(this.collection, 'remove', this.removeRow);
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        events: this.collection.map(function(event) { return event.serializeRow(true); }),
        renderEventRow: eventRowTemplate
      };
    },

    addRow: function(event)
    {
      this.$('tbody').prepend(eventRowTemplate({
        event: event.serializeRow(true)
      }));
    },

    removeRow: function(event)
    {
      this.$('tr[data-id="' + event.id + '"]').remove();
    }

  });
});
