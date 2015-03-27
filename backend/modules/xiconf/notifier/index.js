// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var step = require('h5.step');

module.exports = function setUpXiconfNotifier(app, xiconfModule)
{
  var mailSender = app[xiconfModule.config.mailSenderId];
  var mongoose = app[xiconfModule.config.mongooseId];
  var User = mongoose.model('User');
  var Order = mongoose.model('Order');
  var ProdShiftOrder = mongoose.model('ProdShiftOrder');
  var XiconfOrder = mongoose.model('XiconfOrder');

  app.broker.subscribe('xiconf.orders.*.changed', onOrderChanged);

  function onOrderChanged(message)
  {
    checkOrderStatus(message.orderNo);
  }

  function checkOrderStatus(orderNo)
  {
    step(
      function findOrdersStep()
      {
        var prodShiftOrderFields = {
          prodLine: 1,
          division: 1,
          master: 1,
          leader: 1,
          quantityDone: 1
        };

        Order.findById(orderNo, {name: 1, nc12: 1, qty: 1}).lean().exec(this.parallel());
        ProdShiftOrder.find({orderId: orderNo}, prodShiftOrderFields).lean().exec(this.parallel());
        XiconfOrder.findById(orderNo).lean().exec(this.parallel());
      },
      function checkStatusStep(err, order, prodShiftOrders, xiconfOrder)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!xiconfOrder || xiconfOrder.status !== -1)
        {
          return this.done();
        }

        this.order = order;
        this.prodShiftOrders = prodShiftOrders;
        this.xiconfOrder = xiconfOrder;

        setImmediate(this.next());
      },
      function findConcernedUsersStep()
      {
        var userIds = {};
        var divisionIds = {};
        var prodLineIds = {};

        _.forEach(this.prodShiftOrders, function(prodShiftOrder)
        {
          divisionIds[prodShiftOrder.division] = true;
          prodLineIds[prodShiftOrder.prodLine] = prodShiftOrder.division;

          if (prodShiftOrder.master)
          {
            userIds[prodShiftOrder.master.id] = true;
          }

          if (prodShiftOrder.leader)
          {
            userIds[prodShiftOrder.leader.id] = true;
          }
        });

        userIds = Object.keys(userIds);

        if (!userIds.length)
        {
          xiconfModule.info("No users to notify about a status of the [%s] order :(", orderNo);

          return this.done();
        }

        var conditions = {
          $or: [
            {
              _id: {$in: userIds}
            },
            {
              prodFunction: 'manager',
              orgUnitId: {$in: Object.keys(divisionIds)}
            },
            {
              privileges: 'XICONF:NOTIFY'
            }
          ]
        };

        User.find(conditions, {email: 1}).lean().exec(this.next());

        this.prodLineIds = prodLineIds;
      },
      function sendEmailStep(err, users)
      {
        if (err)
        {
          return this.skip(err);
        }

        users = users.filter(function(user) { return _.isString(user.email) && user.email.indexOf('@') > 0; });

        if (!users.length)
        {
          xiconfModule.warn(
            "Can't notify anyone about a status of the [%s] order: no user with a valid e-mail address.",
            orderNo
          );

          return this.done();
        }

        var orderUrl = this.order ? xiconfModule.config.emailUrlPrefix + '#orders/' + orderNo : '-';
        var xiconfOrderUrl = xiconfModule.config.emailUrlPrefix + '#xiconf/orders/' + orderNo;
        var productNc12 = (this.order ? this.order.nc12 : null) || '?';
        var productName = (this.order ? this.order.name : null) || '?';
        var quantityTodo = this.order ? this.order.qty.toLocaleString() : '?';
        var quantityDone = this.prodShiftOrders
          .reduce(function(total, pso) { return total + pso.quantityDone; }, 0)
          .toLocaleString();

        var to = users.map(function(user) { return user.email; });
        var subject = '[WMES] Nieukończone zlecenie programowe ' + orderNo;
        var text = [
          'Zakończono wykonywanie zlecenia, w którym nie zaprogramowano wszystkich opraw!',
          '',
          'Nr zlecenia: ' + orderNo,
          '12NC wyrobu: ' + productNc12,
          'Nazwa wyrobu: ' + productName,
          'Ilość ze zleceń: ' + quantityDone + '/' + quantityTodo,
          'Ilość zaprogramowana: '
            + this.xiconfOrder.quantityDone.toLocaleString() + '/'
            + this.xiconfOrder.quantityTodo.toLocaleString()
        ];

        _.forEach(this.xiconfOrder.items, function(item, i)
        {
          text.push(
            '',
            '12NC #' + (i + 1) + ': ' + item.nc12,
            'Nazwa: ' + item.name,
            'Ilość: ' + item.quantityTodo.toLocaleString() + '/' + item.quantityDone.toLocaleString()
          );
        });

        text.push('', 'Zlecenie wykonywane było na następujących liniach produkcyjnych:');

        _.forEach(this.prodLineIds, function(prodLineId)
        {
          text.push('  - ' + prodLineId);
        });

        text.push(
          '',
          'Zlecenie produkcyjne: ' + orderUrl,
          'Zlecenie programowe: ' + xiconfOrderUrl,
          '',
          'Ta wiadomość została wygenerowana automatycznie przez system WMES.'
        );

        var mailOptions = {
          to: to,
          replyTo: to,
          subject: subject,
          text: text.join('\r\n')
        };

        mailSender.send(mailOptions, this.next());
      },
      function finalizeStep(err)
      {
        if (err)
        {
          xiconfModule.error("Failed to notify users about a status of the [%s] order: %s", err.message);
        }
      }
    );
  }
};
