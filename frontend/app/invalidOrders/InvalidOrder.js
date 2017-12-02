// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/time',
  'app/core/Model',
  'app/orders/util/resolveProductName'
], function(
  t,
  time,
  Model,
  resolveProductName
) {
  'use strict';

  return Model.extend({

    urlRoot: '/invalidOrders',

    clientUrlRoot: '#invalidOrders',

    topicPrefix: 'orders.invalid',

    privilegePrefix: 'ORDERS',

    nlsDomain: 'invalidOrders',

    serialize: function()
    {
      var o = this.toJSON();

      o.className = o.status === 'ignored'
        ? 'warning'
        : o.status === 'resolved'
          ? 'success'
          : 'danger';

      o.orderNo = '<a href="#orders/' + o._id + '">' + o._id + '</a>';

      if (o.order)
      {
        if (!o.order.qtyDone)
        {
          o.order.qtyDone = {total: 0};
        }

        o.nc12 = o.order.nc12;
        o.productName = resolveProductName(o.order);
        o.qty = (o.order.qtyDone.total ? o.order.qtyDone.total : '0') + '/' + o.order.qty;

        var startMoment = time.getMoment(o.order.scheduledStartDate);

        o.startDate = startMoment.format('L');

        if (o.status === 'invalid')
        {
          var startDiff = startMoment.diff(Date.now(), 'hours');

          if (startDiff < 12)
          {
            o.className += ' invalidOrders-veryLate';
          }
          else if (startDiff < 24)
          {
            o.className += ' invalidOrders-late';
          }
        }
      }

      o.problem = t('invalidOrders', 'problem:' + o.problem);

      if (window.IPT_ORDER_CHECK_URL)
      {
        o.problem = '<a href="' + window.IPT_ORDER_CHECK_URL.replace('${order}', o._id) + '">' + o.problem + '</a>';
      }

      if (o.solution)
      {
        o.solution = t('invalidOrders', 'solution:' + o.solution);
      }

      if (o.iptStatus === o.iptComment)
      {
        o.iptComment = '';
      }

      return o;
    }

  });
});
