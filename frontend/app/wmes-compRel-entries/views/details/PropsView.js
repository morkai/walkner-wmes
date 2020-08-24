// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/DetailsView',
  'app/wmes-compRel-entries/templates/details/props'
], function(
  DetailsView,
  template
) {
  'use strict';

  return DetailsView.extend({

    template: template,

    remoteTopics: [],

    initialize: function()
    {
      DetailsView.prototype.initialize.apply(this, arguments);

      this.usedProps = [];
    },

    afterRender: function()
    {
      DetailsView.prototype.afterRender.apply(this, arguments);

      this.usedProps = this.$('.prop[data-prop]').map(function() { return this.dataset.prop; }).get().concat([
        'oldCode', 'oldName',
        'newCode', 'newName'
      ]);
    },

    onModelChanged: function(model)
    {
      if (this.usedProps.some(function(prop) { return typeof model.changed[prop] !== 'undefined'; }))
      {
        this.render();
      }
    }

  });
});
