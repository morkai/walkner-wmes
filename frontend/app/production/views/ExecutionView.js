// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  './ExecutionTimelineView',
  'app/production/templates/execution'
], function(
  View,
  ExecutionTimelineView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    initialize: function()
    {
      this.listenTo(this.model.execution, 'newOrderRequested', function(order)
      {
        this.model.trigger('newOrderRequested', order);
      });

      this.todoView = new ExecutionTimelineView({
        type: 'todo',
        model: this.model.execution
      });
      this.doneView = new ExecutionTimelineView({
        type: 'done',
        model: this.model.execution
      });

      this.setView('#-todo', this.todoView);
      this.setView('#-done', this.doneView);
    }

  });
});
