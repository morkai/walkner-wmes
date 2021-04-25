// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/viewport',
  'app/core/View',
  './CoordinateView',
  'app/suggestions/templates/coordSections'
], function(
  $,
  viewport,
  View,
  CoordinateView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click .js-coordinate': function(e)
      {
        var $coordSection = this.$(e.target).closest('.suggestions-details-coordSection');

        var dialogView = new CoordinateView({
          model: this.model,
          coordSection: this.model.getCoordSection($coordSection[0].dataset.section)
        });

        viewport.showDialog(dialogView, this.t('coordinate:title', {rid: this.model.get('rid')}));
      }
    },

    initialize: function()
    {
      View.prototype.initialize.call(this);

      this.once('afterRender', function()
      {
        this.listenTo(this.model, 'reset change:coordSections', this.render);
      });

      $(window).on('resize.' + this.idPrefix, this.onWindowResize.bind(this));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
    },

    getTemplateData: function()
    {
      var changes = this.model.get('observer').changes;

      return {
        changed: changes.all || changes.resolutions,
        coordSections: this.model.serializeCoordSections()
      };
    },

    afterRender: function()
    {
      if (!this.options.embedded)
      {
        this.toggleOverflowX();
      }
    },

    toggleOverflowX: function()
    {
      this.$id('coordSections').css(
        'overflow-x',
        (this.$el.outerWidth() + 50) < window.innerWidth ? 'visible' : ''
      );
    },

    onWindowResize: function()
    {
      this.toggleOverflowX();
    }

  });
});
