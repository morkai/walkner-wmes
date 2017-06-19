// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const moment = require('moment');

module.exports = function setUpXiconfNotifier(app, xiconfModule)
{
  const mailSender = app[xiconfModule.config.mailSenderId];
  const mongoose = app[xiconfModule.config.mongooseId];
  const settingsModule = app[xiconfModule.config.settingsId];
  const User = mongoose.model('User');
  const Order = mongoose.model('Order');
  const ProdShiftOrder = mongoose.model('ProdShiftOrder');
  const XiconfOrder = mongoose.model('XiconfOrder');

  let emailUrlPrefix = xiconfModule.config.emailUrlPrefix;

  if (emailUrlPrefix.substr(-1) !== '/')
  {
    emailUrlPrefix += '/';
  }

  app.broker.subscribe('xiconf.orders.*.changed', onOrderChanged);

  function onOrderChanged(message)
  {
    checkOrderStatus(message.orderNo);
  }

  function checkOrderStatus(orderNo)
  {
    step(
      function findSettingsStep()
      {
        settingsModule.findValues({_id: /^xiconf\.notifier\./}, 'xiconf.notifier.', this.next());
      },
      function findOrdersStep(err, settings)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!settings.enabled)
        {
          return this.done();
        }

        this.settings = settings;

        const prodShiftOrderFields = {
          prodLine: 1,
          division: 1,
          master: 1,
          leader: 1,
          quantityDone: 1,
          startedAt: 1,
          finishedAt: 1,
          'orderData.unit': 1
        };

        Order
          .findById(orderNo, {name: 1, nc12: 1, qty: 1})
          .lean()
          .exec(this.parallel());

        ProdShiftOrder
          .find({orderId: orderNo, finishedAt: {$ne: null}}, prodShiftOrderFields)
          .lean()
          .exec(this.parallel());

        XiconfOrder
          .findById(orderNo, {'items.serialNumbers': 0})
          .lean()
          .exec(this.parallel());
      },
      function checkStatusStep(err, order, prodShiftOrders, xiconfOrder)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!xiconfOrder
          || !xiconfOrder.items.length
          || xiconfOrder.status !== -1
          || !prodShiftOrders.length)
        {
          return this.done();
        }

        const noProgramItems = !_.some(xiconfOrder.items, 'kind', 'program');
        const hasAnyLedItems = _.some(xiconfOrder.items, 'kind', 'led');
        const hasAnyHidItems = _.some(xiconfOrder.items, 'kind', 'hid');

        if (hasAnyLedItems
          && noProgramItems
          && !this.settings.emptyLeds
          && xiconfOrder.quantityDone === 0)
        {
          return this.done();
        }

        if (hasAnyHidItems
          && noProgramItems
          && !this.settings.emptyHids
          && xiconfOrder.quantityDone === 0)
        {
          return this.done();
        }

        if (filterOrderName(this.settings.nameFilter || '', order.name))
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
        const userIds = {};
        const divisionIds = {};
        const prodLineMap = {};

        _.forEach(this.prodShiftOrders, function(pso)
        {
          divisionIds[pso.division] = true;

          if (!prodLineMap[pso.prodLine])
          {
            prodLineMap[pso.prodLine] = {
              division: pso.division,
              times: []
            };
          }

          let qty = pso.quantityDone.toLocaleString();

          if (pso.orderData && pso.orderData.unit)
          {
            qty += ' ' + pso.orderData.unit;
          }

          prodLineMap[pso.prodLine].times.push({
            from: app.formatDateTime(pso.startedAt),
            to: app.formatTime(pso.finishedAt),
            qty: qty
          });

          if (pso.master)
          {
            userIds[pso.master.id] = true;
          }

          if (pso.leader)
          {
            userIds[pso.leader.id] = true;
          }
        });

        const conditions = {
          $or: [
            {
              _id: {$in: Object.keys(userIds)}
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

        this.prodLineMap = prodLineMap;
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

        const orderUrl = this.order ? (emailUrlPrefix + 'r/productionOrder/' + orderNo) : '-';
        const xiconfOrderUrl = emailUrlPrefix + 'r/xiconfOrder/' + orderNo;
        const prodShiftOrdersUrl = emailUrlPrefix + 'r/prodShiftOrders/' + orderNo;
        const productNc12 = this.xiconfOrder.nc12[0];
        const productName = this.xiconfOrder.name;
        const quantityTodo = this.xiconfOrder.quantityTodo.toLocaleString();
        let quantityDone = 0;
        let firstStartedAt = Number.MAX_VALUE;
        let lastFinishedAt = Number.MIN_VALUE;
        const ordersTimes = [];

        _.forEach(this.prodShiftOrders, function(pso)
        {
          quantityDone += pso.quantityDone;

          const startedAt = pso.startedAt.getTime();
          const finishedAt = pso.finishedAt.getTime();

          if (startedAt < firstStartedAt)
          {
            firstStartedAt = startedAt;
          }

          if (finishedAt > lastFinishedAt)
          {
            lastFinishedAt = finishedAt;
          }

          ordersTimes.push({
            startedAt: startedAt,
            finishedAt: finishedAt
          });
        });

        const totalDuration = lastFinishedAt - firstStartedAt;
        const workDuration = calculateNonOverlappingWorkDuration(ordersTimes);

        let incompleteProgramItemCount = 0;
        let incompleteLedItemCount = 0;
        let incompleteHidItemCount = 0;
        let incompleteTestItemCount = 0;
        let incompleteFtItemCount = 0;

        _.forEach(this.xiconfOrder.items, function(item)
        {
          if (item.quantityDone >= item.quantityTodo)
          {
            return;
          }

          if (item.kind === 'program')
          {
            if (incompleteProgramItemCount > 0 && item.quantityDone === 0)
            {
              return;
            }

            incompleteProgramItemCount += 1;
          }
          else if (item.kind === 'led')
          {
            incompleteLedItemCount += 1;
          }
          else if (item.kind === 'hid')
          {
            incompleteHidItemCount += 1;
          }
          else if (item.kind === 'test')
          {
            incompleteTestItemCount += 1;
          }
          else if (item.kind === 'ft')
          {
            incompleteFtItemCount += 1;
          }
        });

        const to = users.map(function(user) { return user.email; });
        const text = [];
        let subject;

        if (quantityDone < quantityTodo)
        {
          subject = '[WMES] Przerwane zlecenie ' + orderNo;

          text.push('Przerwano wykonywanie zlecenia, w którym:');
        }
        else
        {
          subject = '[WMES] Nieukończone zlecenie ' + orderNo;

          text.push('Zakończono wykonywanie zlecenia, w którym:');
        }

        if (incompleteProgramItemCount)
        {
          text.push('  - nie zaprogramowano wszystkich opraw!');
        }

        if (incompleteTestItemCount)
        {
          text.push('  - nie przetestowano wszystkich opraw!');
        }

        if (incompleteLedItemCount)
        {
          text.push('  - nie zeskanowano wszystkich płytek LED!');
        }

        if (incompleteHidItemCount)
        {
          text.push('  - nie zeskanowano wszystkich lamp HID!');
        }

        if (incompleteFtItemCount)
        {
          text.push('  - nie sprawdzono wszystkich ramek!');
        }

        text.push(
          '',
          'Nr zlecenia: ' + orderNo,
          '12NC wyrobu: ' + productNc12,
          'Nazwa wyrobu: ' + productName.replace(/[^a-zA-Z0-9-_%\/\\\(\) ]/g, ''),
          'Ilość ze zleceń z linii: ' + quantityDone + '/' + quantityTodo,
          'Ilość ze zlecenia Xiconf: '
            + this.xiconfOrder.quantityDone.toLocaleString() + '/'
            + this.xiconfOrder.quantityTodo.toLocaleString()
        );

        _.forEach(this.xiconfOrder.items, function(item, i)
        {
          const quantity = item.kind === 'gprs'
            ? item.quantityTodo.toLocaleString()
            : (item.quantityDone.toLocaleString() + '/' + item.quantityTodo.toLocaleString());

          if (item.kind === 'test')
          {
            text.push(
              '',
              'Nazwa programu: ' + item.name,
              'Ilość: ' + quantity
            );
          }
          else if (item.kind === 'ft')
          {
            text.push(
              '',
              'Nazwa: Test ramki',
              'Ilość: ' + quantity
            );
          }
          else
          {
            text.push(
              '',
              '12NC #' + (i + 1) + ': ' + item.nc12,
              'Nazwa: ' + item.name,
              'Ilość: ' + quantity
            );
          }
        });

        text.push(
          '',
          'Zlecenie wykonywane było na następujących liniach produkcyjnych:'
        );

        _.forEach(this.prodLineMap, function(prodLineInfo, prodLineId)
        {
          text.push('  - ' + prodLineInfo.division + ' \\ ' + prodLineId + ':');

          _.forEach(prodLineInfo.times, function(time)
          {
            text.push('    - ' + time.qty + ' od ' + time.from + ' do ' + time.to);
          });
        });

        text.push(
          '',
          'Czas rozpoczęcia zlecenia: ' + moment(firstStartedAt).format('LLLL'),
          'Czas zakończenia zlecenia: ' + moment(lastFinishedAt).format('LLLL'),
          'Całkowity czas trwania: ' + formatDuration(totalDuration),
          'Całkowity czas pracy: ' + formatDuration(workDuration)
        );

        text.push(
          '',
          'Zlecenie Xiconf: ' + xiconfOrderUrl,
          'Zlecenie produkcyjne: ' + orderUrl,
          'Zlecenia z linii: ' + prodShiftOrdersUrl,
          '',
          'Ta wiadomość została wygenerowana automatycznie przez WMES.'
        );

        const mailOptions = {
          to: to,
          replyTo: to,
          subject: subject,
          text: text.join('\t\r\n')
        };

        mailSender.send(mailOptions, this.next());
      },
      function finalizeStep(err)
      {
        if (err)
        {
          xiconfModule.error('Failed to notify users about a status of the [%s] order: %s', err.message);
        }
      }
    );
  }

  function calculateNonOverlappingWorkDuration(times)
  {
    let totalWorkDuration = 0;

    if (times.length === 0)
    {
      return totalWorkDuration;
    }

    if (times.length === 1)
    {
      return times[0].finishedAt - times[0].startedAt;
    }

    times.sort(function(a, b) { return a.startedAt - b.startedAt; });

    const current = {
      startedAt: 0,
      finishedAt: 0
    };

    for (let i = 0; i < times.length; ++i)
    {
      const time = times[i];

      if (time.startedAt > current.finishedAt)
      {
        totalWorkDuration += current.finishedAt - current.startedAt;

        current.startedAt = time.startedAt;
        current.finishedAt = time.finishedAt;

        continue;
      }

      if (time.finishedAt > current.finishedAt)
      {
        current.finishedAt = time.finishedAt;
      }
    }

    totalWorkDuration += current.finishedAt - current.startedAt;

    return totalWorkDuration;
  }

  function formatDuration(time)
  {
    if (typeof time !== 'number' || time <= 0)
    {
      return '0s';
    }

    time /= 1000;

    let str = '';
    const hours = Math.floor(time / 3600);

    if (hours > 0)
    {
      str += ' ' + hours + 'h';
      time %= 3600;
    }

    const minutes = Math.floor(time / 60);

    if (minutes > 0)
    {
      str += ' ' + minutes + 'min';
      time %= 60;
    }

    const seconds = time;

    if (seconds >= 1)
    {
      str += ' ' + Math.round(seconds) + 's';
    }
    else if (seconds > 0 && str === '')
    {
      str += ' ' + (seconds * 1000) + 'ms';
    }

    return str.substr(1);
  }

  function filterOrderName(nameFilter, name)
  {
    const nameFilters = nameFilter.split(/\n|;/);

    for (let i = 0; i < nameFilters.length; ++i)
    {
      let pattern = nameFilters[i].trim();

      if (!pattern.length)
      {
        continue;
      }

      if (pattern[0] === '/' && pattern.charAt(pattern.length - 1) === '/')
      {
        pattern = createPattern(pattern);

        if (pattern && pattern.test(name))
        {
          return true;
        }

        continue;
      }

      if (name.indexOf(pattern) !== -1)
      {
        return true;
      }
    }

    return false;
  }

  function createPattern(pattern)
  {
    try
    {
      return new RegExp(pattern.substr(1, pattern.length - 1), 'i');
    }
    catch (err)
    {
      return null;
    }
  }
};
