// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/wmes-osh-common/pages/DetailsPage',
  'app/wmes-osh-common/views/AttachmentsView',
  'app/wmes-osh-common/views/PanelView',
  'app/wmes-osh-kaizens/templates/details/page',
  'app/wmes-osh-kaizens/templates/details/props'
], function(
  _,
  $,
  DetailsPage,
  AttachmentsView,
  PanelView,
  template,
  propsTemplate
) {
  'use strict';

  return DetailsPage.extend({

    template,
    propsTemplate,

    initialize: function()
    {
      DetailsPage.prototype.initialize.apply(this, arguments);

      this.once('afterRender', () =>
      {
        const resizePanels = _.debounce(this.resizePanels.bind(this), 33);

        $(window).on(`resize.${this.idPrefix}`, resizePanels);
      });
    },

    defineViews: function()
    {
      DetailsPage.prototype.defineViews.apply(this, arguments);

      this.setView('#-problem', new PanelView({
        model: this.model,
        property: 'problem',
        panelType: 'danger'
      }));

      this.setView('#-reason', new PanelView({
        model: this.model,
        property: 'reason',
        panelType: 'warning'
      }));

      this.setView('#-before', new AttachmentsView({
        model: this.model,
        kind: 'before'
      }));

      this.setView('#-suggestion', new PanelView({
        model: this.model,
        property: 'suggestion',
        panelType: 'secondary'
      }));

      this.setView('#-solution', new PanelView({
        model: this.model,
        property: 'solution',
        panelType: 'success'
      }));

      this.setView('#-after', new AttachmentsView({
        model: this.model,
        kind: 'after'
      }));
    },

    getAttachmentsViewOptions: function()
    {
      return Object.assign(DetailsPage.prototype.getAttachmentsViewOptions.apply(this, arguments), {
        kind: 'other'
      });
    },

    afterRender: function()
    {
      this.resizePanels();
    },

    resizePanels: function()
    {
      const $problem = this.$id('problem').find('.panel-body');
      const $reason = this.$id('reason').find('.panel-body');
      const $suggestion = this.$id('suggestion').find('.panel-body');
      const $solution = this.$id('solution').find('.panel-body');

      [$problem, $reason, $suggestion, $solution].forEach($panel =>
      {
        $panel.css('height', '');
      });

      if (window.innerWidth < 1200)
      {
        return;
      }

      [[$problem, $suggestion], [$reason, $solution]].forEach(group =>
      {
        const maxHeight = Math.max.apply(Math, group.map($panel => $panel.outerHeight()));

        group.forEach($panel => $panel.css('height', `${maxHeight}px`));
      });
    }

  });
});
