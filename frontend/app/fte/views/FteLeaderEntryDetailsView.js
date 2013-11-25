define([
  'underscore',
  'app/core/View',
  'app/fte/templates/leaderEntry',
  'i18n!app/nls/fte'
], function(
  _,
  View,
  leaderEntryTemplate
) {
  'use strict';

  return View.extend({

    template: leaderEntryTemplate,

    idPrefix: 'leaderEntryDetails',

    serialize: function()
    {
      return _.extend(this.model.serializeWithTotals(), {editable: false});
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'change', this.render);
    }

  });
});
