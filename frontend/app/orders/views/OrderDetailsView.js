// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
  detailsTemplate,
  renderOrderStatusLabel
) {
  'use strict';

  return DetailsView.extend({

    template: detailsTemplate,

    remoteTopics: {},

    localTopics: {
      'orderStatuses.synced': 'render'
    },

    serialize: function()
    {
      var order = this.model.toJSON();
      var delayReason = this.delayReasons.get(order.delayReason);

      order.statusLabels = orderStatuses.findAndFill(order.statuses).map(renderOrderStatusLabel).join('');
      order.delayReason = delayReason ? delayReason.getLabel() : null;

      return {
        model: order,
        panelType: this.options.panelType || 'primary',
        panelTitle: this.options.panelTitle || t('orders', 'PANEL:TITLE:details'),
        linkOrderNo: !!this.options.linkOrderNo
      };
    }

  });
});
