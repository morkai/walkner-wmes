// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/orderStatuses/util/renderOrderStatusLabel'
], function(
  _,
  t,
  renderOrderStatusLabel
) {
  'use strict';

  var SAP_STATUSES = ['CNF', 'DLV', 'TECO'];

  function formatIcon(icon, title)
  {
    return '<span class="planning-mrp-list-property" title="' + _.escape(t('planning', title)) + '">'
      + '<i class="fa ' + icon + '"></i>'
      + '</span>';
  }

  return function(plan, orderNo, options)
  {
    var statuses = [];
    var planOrder = plan.orders.get(orderNo);
    var orderData = plan.getActualOrderData(orderNo);
    var kindIcon = planOrder.getKindIcon();
    var sourceIcon = planOrder.getSourceIcon();
    var psStatus = plan.sapOrders.getPsStatus(orderNo);
    var whStatus = plan.sapOrders.getWhStatus(orderNo);

    if (planOrder.get('ignored'))
    {
      statuses.push(formatIcon(planOrder.getIcon('ignored'), 'orders:ignored'));
    }

    if (kindIcon)
    {
      statuses.push(formatIcon(kindIcon, 'orderPriority:' + planOrder.get('kind')));
    }

    if (sourceIcon)
    {
      statuses.push(formatIcon(sourceIcon, 'orders:source:' + planOrder.get('source')));
    }

    if (planOrder.get('urgent') && planOrder.get('source') !== 'incomplete')
    {
      statuses.push(formatIcon(planOrder.getIcon('urgent'), 'orders:urgent'));
    }

    if (planOrder.isPinned())
    {
      statuses.push(formatIcon(planOrder.getIcon('pinned'), 'orders:pinned'));
    }

    if (plan.sapOrders.isEto(orderNo))
    {
      statuses.push(formatIcon(planOrder.getIcon('eto'), 'orders:eto'));
    }

    if (orderData.priority)
    {
      statuses.push(
        '<span class="planning-mrp-list-property planning-mrp-list-property-priority" '
        + 'title="' + t('planning', 'orders:priority', {priority: orderData.priority}) + '" '
        + '>' + orderData.priority + '</span>'
      );
    }

    statuses.push('<span class="planning-mrp-list-property planning-mrp-list-property-psStatus" '
      + 'title="' + t('planning', 'orders:psStatus:' + psStatus) + '" '
      + 'data-ps-status="' + psStatus + '">'
      + '<i class="fa ' + planOrder.getIcon('psStatus') + '"></i></span>');

    statuses.push('<span class="planning-mrp-list-property planning-mrp-list-property-whStatus" '
      + 'title="' + t('planning', 'orders:whStatus:' + whStatus) + '" '
      + 'data-wh-status="' + whStatus + '">'
      + '<i class="fa ' + planOrder.getIcon('whStatus') + '"></i></span>');

    if (!options || options.sapStatuses !== false)
    {
      SAP_STATUSES.forEach(function(sapStatus)
      {
        if (orderData.statuses.indexOf(sapStatus) !== -1)
        {
          statuses.push(renderOrderStatusLabel(sapStatus));
        }
      });
    }

    return statuses.join('');
  };
});
