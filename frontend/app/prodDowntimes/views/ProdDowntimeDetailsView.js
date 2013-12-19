define([
  'underscore',
  'app/i18n',
  'app/core/View',
  './decorateProdDowntime',
  'app/prodDowntimes/templates/details',
  'i18n!app/nls/prodDowntimes'
], function(
  _,
  t,
  View,
  decorateProdDowntime,
  detailsTemplate
) {
  'use strict';

  return View.extend({

    template: detailsTemplate,

    remoteTopics: {
      'prodDowntimes.finished.*': function(message)
      {
        if (this.model.id === message._id)
        {
          this.model.set('finishedAt', new Date(message.finishedAt));
        }
      },
      'prodDowntimes.corroborated.*': function(message)
      {
        if (this.model.id === message._id)
        {
          this.model.set(message);
        }
      }
    },

    initialize: function()
    {
      this.listenTo(this.model, 'change', _.after(2, this.render.bind(this)));
    },

    serialize: function()
    {
      return {
        model: decorateProdDowntime(this.model)
      };
    }

  });
});
