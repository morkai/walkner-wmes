// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/core/util/decimalSeparator',
  'app/orders/util/prepareReleasedBom',
  'app/orderDocuments/templates/bomAndViewer',
  'app/orderDocuments/templates/bomAndViewerComponent',
  'css!app/orderDocuments/assets/bomAndViewer'
], function(
  View,
  decimalSeparator,
  prepareReleasedBom,
  template,
  componentTemplate
) {
  'use strict';

  return View.extend({

    template: template,

    dialogClassName: 'orderDocuments-bomAndViewer-dialog',

    initialize: function()
    {
      this.once('afterRender', () =>
      {
        const $modal = this.$el.closest('.modal');

        this.timers.focus = setInterval(() => $modal.focus(), 100);

        this.loadBom();
      });
    },

    loadBom: function()
    {
      const req = this.ajax({
        url: `/orders/${this.model.order}?select(qty,bom)`
      });

      req.fail(() =>
      {
        this.$id('bom').find('.fa-spin').removeClass('fa-spin').css('color', '#F00');
      });

      req.done(order =>
      {
        order.bom.forEach(component =>
        {
          component.qty /= order.qty;
        });

        this.renderBom(prepareReleasedBom(order.bom, order.compRels).components);
      });
    },

    renderBom: function(bom)
    {
      let html = '';

      bom.forEach(component =>
      {
        html += this.renderPartialHtml(componentTemplate, {
          component,
          decimalSeparator
        });
      });

      this.$id('bom').html(html);
    },

    onDialogShown: function()
    {
      this.$id('iframe').prop('src', `/orderDocuments/${this.model.document.nc15}?order=${this.model.order}`);
    }

  });
});
