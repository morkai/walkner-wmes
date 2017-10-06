// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/views/DetailsView',
  'app/data/orderStatuses',
  'app/orders/templates/details',
  'app/orderStatuses/util/renderOrderStatusLabel'
], function(
  t,
  DetailsView,
  orderStatuses,
  template,
  renderOrderStatusLabel
) {
  'use strict';

  return DetailsView.extend({

    template: template,

    remoteTopics: {},

    localTopics: {
      'orderStatuses.synced': 'render'
    },

    serialize: function()
    {
      var order = this.model.toJSON();
      var delayReason = this.delayReasons.get(order.delayReason);

      order.statusLabels = orderStatuses.findAndFill(order.statuses).map(renderOrderStatusLabel).join(' ');
      order.delayReason = delayReason ? delayReason.getLabel() : null;

      return {
        idPrefix: this.idPrefix,
        model: order,
        panelType: this.options.panelType || 'primary',
        panelTitle: this.options.panelTitle || t('orders', 'PANEL:TITLE:details'),
        linkOrderNo: !!this.options.linkOrderNo
      };
    }

  });
});
