// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/time',
  'app/core/View',
  'app/paintShop/templates/load/stats'
], function(
  t,
  time,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    localTopics: {
      'socket.connected': function()
      {
        this.promised(this.model.fetch());
      }
    },

    remoteTopics: {
      'paintShop.load.updated': function(stats)
      {
        this.model.set(stats);
      }
    },

    initialize: function()
    {
      this.listenTo(this.model, 'change', this.render);
    },

    destroy: function()
    {

    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        stats: this.model.attributes
      };
    }

  });
});
