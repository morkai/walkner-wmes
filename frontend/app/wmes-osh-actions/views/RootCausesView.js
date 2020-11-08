// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/View',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-actions/templates/details/rootCauses'
], function(
  _,
  View,
  dictionaries,
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
        this.listenTo(this.model, 'change:rootCauses', this.render);
        this.listenTo(this.model, 'seen', this.onSeen);
      });
    },

    getTemplateData: function()
    {
      const observer = this.model.getObserver();

      return {
        rootCauses: this.serializeRootCauses(),
        unseen: observer.notify && (observer.changes.all || observer.changes.rootCauses)
      };
    },

    serializeRootCauses: function()
    {
      return (this.model.get('rootCauses') || [])
        .map(rootCause =>
        {
          const category = dictionaries.getLabel('rootCauseCategories', rootCause.category, {long: true});

          return {
            category: category || rootCause.category,
            why: rootCause.why.filter(why => !!why)
          };
        })
        .filter(rootCause => !!rootCause.why.length);
    },

    onSeen: function()
    {
      this.$('.osh-unseen').removeClass('osh-unseen');
    }

  });
});
