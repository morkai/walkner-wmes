// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/core/Model',
  'app/core/templates/userInfo'
], function(
  _,
  t,
  time,
  Model,
  userInfoTemplate
) {
  'use strict';

  t = t.forDomain('wh-events');

  function prop(key, value)
  {
    return '<span class="wh-events-prop">'
      + '<span class="wh-events-prop-name">' + t('data:' + key) + '</span>'
      + '<span class="wh-events-prop-value">' + value + '</span>'
      + '</span>';
  }

  return Model.extend({

    urlRoot: '/old/wh/events',

    clientUrlRoot: '#wh/events',

    topicPrefix: 'old.wh.events',

    privilegePrefix: 'WH',

    nlsDomain: 'wh-events',

    serialize: function()
    {
      var obj = this.toJSON();

      obj.type = t('type:' + obj.type);
      obj.time = time.format(obj.time, 'L, HH:mm:ss');
      obj.user = userInfoTemplate({userInfo: obj.user});

      if (obj.data.whUser)
      {
        obj.whUser = userInfoTemplate({userInfo: obj.data.whUser});
      }

      obj.data = this.serializeData();

      return obj;
    },

    serializeData: function()
    {
      var type = this.get('type');
      var data = this.get('data');
      var sets = {};
      var html = [];

      if (!data.func && data.whUser && data.whUser.func)
      {
        data.func = data.whUser.func;
      }

      if (data.func)
      {
        html.push(prop('func', t('func:' + data.func)));
      }

      if (data.oldValue && data.newValue)
      {
        html.push(prop(type, t('status:' + type + ':' + data.newValue)));
      }

      if (Array.isArray(data.lines) && data.lines.length)
      {
        if (/Redir/.test(type))
        {
          if (data.lines.length > 1)
          {
            html.push(prop('sourceLine', data.lines[0]));
            html.push(prop('targetLine', data.lines[1]));
          }
          else
          {
            html.push(prop('targetLine', data.lines[0]));
          }
        }
        else
        {
          html.push(prop(data.lines.length === 1 ? 'line' : 'lines', data.lines.map(_.escape).join(', ')));
        }
      }

      if (Array.isArray(data.orders) && data.orders.length)
      {
        var orders = [];

        data.orders.forEach(function(order)
        {
          if (order.sapOrder)
          {
            if (!sets[order.date])
            {
              sets[order.date] = {};
            }

            sets[order.date][order.set || '?'] = 1;

            orders.push(order.sapOrder);
          }
        });

        if (orders.length)
        {
          html.push(prop('orders', _.uniq(_.map(data.orders, 'sapOrder')).join(', ')));
        }
      }

      if (Array.isArray(data.setCarts) && data.setCarts.length)
      {
        html.push(prop('setCarts', data.setCarts
          .map(function(setCart)
          {
            return setCart.cart + (setCart.forced ? '!' : '');
          })
          .join(', ')
        ));
      }

      if (data.kind)
      {
        html.push(prop('kind', t('kind:' + data.kind)));
      }

      if (!_.isEmpty(sets))
      {
        html.push(prop('sets', _.map(sets, function(sets, date)
        {
          return time.utc.format(date, 'L') + ': ' + Object.keys(sets).join(', ');
        }).join('; ')));
      }

      ['qty', 'problemArea'].forEach(function(p)
      {
        if (data[p] != null)
        {
          html.push(prop(p, _.escape(String(data[p]))));
        }
      });

      ['oldStartedPlan', 'newStartedPlan'].forEach(function(p)
      {
        if (data[p] != null)
        {
          html.push(prop(p, time.utc.format(data[p], 'L')));
        }
      });

      if (data.duration)
      {
        html.push(prop('duration', time.toString(data.duration / 1000)));
      }

      if (type === 'deliveredOrderEdited' || type === 'deliveredQtyEdited')
      {
        var oldData = data.oldDeliveredOrder;
        var newData = data.newDeliveredOrder;

        if (newData.status)
        {
          html.push(prop('status', t('status:deliveredOrder:' + data.newDeliveredOrder.status)));
        }

        if (_.isNumber(newData.qtyDone))
        {
          html.push(prop(
            'qty',
            oldData.qtyDone + '/' + oldData.qtyTodo
              + ' ➜ '
              + newData.qtyDone + '/' + newData.qtyTodo
          ));
        }
      }
      else if (type === 'deliveredOrderRedired')
      {
        if (data.sourceQtyTodo)
        {
          html.push(prop('sourceQty', data.sourceQtyDone + '/' + data.sourceQtyTodo));
        }

        html.push(prop('targetQty', data.targetQtyDone + '/' + data.targetQtyTodo));
      }
      else if (/^lineRedir/.test(type))
      {
        html.push(prop('redirDelivered', t('core', 'BOOL:' + !!data.redirDelivered)));
      }

      if (data.redirReason && data.redirReason.label)
      {
        html.push(prop('redirReason', _.escape(data.redirReason.label)));
      }

      if (data.forceLine)
      {
        html.push(prop('forceLine', _.escape(data.forceLine)));
      }

      if (data.forceDelivery)
      {
        html.push(prop('forceDelivery', t('core', 'BOOL:true')));
      }

      if (data.priorityPickup)
      {
        html.push(prop('priorityPickup', t('core', 'BOOL:true')));
      }

      if (data.comment)
      {
        html.push(prop('comment', _.escape(data.comment)));
      }

      return html.join('');
    }

  }, {

    TYPES: [
      'newSetStarted',
      'assignedToSet',
      'unassignedFromSet',
      'setContinued',
      'picklistDone',
      'picklist',
      'pickup',
      'labelsPrinted',
      'ordersCancelled',
      'ordersReset',
      'ordersFinished',
      'problemSolved',
      'deliveryStarted',
      'deliveryFinished',
      'deliveredOrderEdited',
      'deliveredQtyEdited',
      'deliveredOrderRedired',
      'startedPlanEdited',
      'lineRedirStarted',
      'lineRedirStopped'
    ]

  });
});
