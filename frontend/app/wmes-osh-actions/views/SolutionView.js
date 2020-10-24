// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/View',
  'app/wmes-osh-actions/templates/details/solution'
], function(
  _,
  View,
  template
) {
  'use strict';

  return View.extend({

    template,

    initialize: function()
    {
      View.prototype.initialize.apply(this, arguments);

      this.once('afterRender', () =>
      {
        this.listenTo(this.model, 'change:solution', _.debounce(this.render, 1));
        this.listenTo(this.model, 'seen', this.onSeen);
      });
    },

    getTemplateData: function()
    {
      const observer = this.model.getObserver();

      return {
        solution: this.model.get('solution'),
        unseen: observer.notify && (observer.changes.all || observer.changes.solution)
      };
    },

    onSeen: function()
    {
      this.$('.osh-unseen').removeClass('osh-unseen');
    }

  });
});
