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
  var XiconfProgramOrder = mongoose.model('XiconfProgramOrder');

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
        Order.findById(orderNo, {name: 1, nc12: 1, qty: 1}).lean().exec(this.parallel());
        ProdShiftOrder.find({orderId: orderNo}, {master: 1, leader: 1, quantityDone: 1}).lean().exec(this.parallel());
        XiconfProgramOrder.findById(orderNo).lean().exec(this.parallel());
      },
      function checkStatusStep(err, order, prodShiftOrders, programOrder)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!programOrder || programOrder.status !== -1)
        {
          return this.done();
        }

        this.order = order;
        this.prodShiftOrders = prodShiftOrders;
        this.programOrder = programOrder;

        setImmediate(this.next());
      },
      function findConcernedUsersStep()
      {
        var userIds = {};

        _.forEach(this.prodShiftOrders, function(prodShiftOrder)
        {
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

        User.find({_id: {$in: userIds}}, {email: 1}).lean().exec(this.next());
      },
      function sendEmailStep(err, users)
      {
        /*jshint multistr:true*/
        if (err)
        {
          return this.skip(err);
        }

        users = users.filter(function(user) { return _.isString(user.email) && user.email.indexOf('@') !== -1; });

        if (!users.length)
        {
          xiconfModule.warn(
            "Can't notify anyone about a status of the [%s] order: no user with a valid e-mail address.",
            orderNo
          );

          return this.done();
        }

        var orderUrl = this.order ? xiconfModule.config.emailUrlPrefix + '#orders/' + orderNo : '-';
        var programOrderUrl = xiconfModule.config.emailUrlPrefix + '#xiconf/programOrders/' + orderNo;
        var productNc12 = (this.order ? this.order.nc12 : null) || '?';
        var productName = (this.order ? this.order.name : null) || '?';
        var quantityTodo = this.order ? this.order.qty.toLocaleString() : '?';
        var quantityDone = this.prodShiftOrders
          .reduce(function(total, pso) { return total + pso.quantityDone; }, 0)
          .toLocaleString();

        var to = users.map(function(user) { return user.email; });
        var subject = '[WMES] Nieukończone zlecenie programowe ' + orderNo;
        var text = [
          'Zakończono wykonywanie zlecenia, w którym nie zaprogramowano wszystkich driverów!',
          '',
          'Nr zlecenia: ' + orderNo,
          '12NC wyrobu: ' + productNc12,
          'Nazwa wyrobu: ' + productName,
          'Ilość: ' + quantityDone + '/' + quantityTodo
        ];

        _.forEach(this.programOrder.nc12, function(nc12, i)
        {
          var quantityTodo = nc12.quantityTodo.toLocaleString();
          var quantityDone = nc12.quantityDone.toLocaleString();

          text.push(
            '',
            '12NC #' + (i + 1) + ': ' + nc12._id,
            'Nazwa programu: ' + nc12.name,
            'Ilość: ' + quantityDone + '/' + quantityTodo
          );
        });

        text.push(
          '',
          'Zlecenie produkcyjne: ' + orderUrl,
          'Zlecenie programowe: ' + programOrderUrl,
          '',
          'Ta wiadomość została wygenerowana automatycznie.'
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
