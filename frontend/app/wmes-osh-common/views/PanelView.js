// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/View',
  'app/wmes-osh-common/templates/details/panel'
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
        this.listenTo(this.model, `change:${this.options.property}`, _.debounce(this.render, 1));
        this.listenTo(this.model, 'seen', this.onSeen);
      });
    },

    getTemplateData: function()
    {
      const observer = this.model.getObserver();

      return {
        panelType: this.options.panelType || 'default',
        propertyName: this.options.property,
        propertyValue: this.model.get(this.options.property),
        unseen: observer.notify && (observer.changes.all || observer.changes[this.options.property])
      };
    },

    onSeen: function()
    {
      this.$('.osh-unseen').removeClass('osh-unseen');
    }

  });
});
