// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/View',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-observations/templates/details/observations'
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
        this.listenTo(this.model, `change:${this.options.property}`, _.debounce(this.render, 1));
        this.listenTo(this.model, 'seen', this.onSeen);
      });
    },

    getTemplateData: function()
    {
      const observer = this.model.getObserver();

      return {
        property: this.options.property,
        observations: this.serializeObservations(),
        unseen: observer.notify && (observer.changes.all || observer.changes[this.options.property])
      };
    },

    serializeObservations: function()
    {
      return this.model.get(this.property).map(function(o)
      {
        if (o.resolution._id)
        {
          const Entry = dictionaries.TYPE_TO_MODEL[o.resolution.type];
          const entry = new Entry({
            _id: o.resolution._id,
            rid: o.resolution.rid
          });

          o.resolution.url = entry.genClientUrl();
        }

        return o;
      });
    },

    onSeen: function()
    {
      this.$('.osh-unseen').removeClass('osh-unseen');
    }

  });
});
