// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const request = require('request');
const moment = require('moment');
const cheerio = require('cheerio');
const businessDays = require('../../reports/businessDays');

module.exports = function setUpNotifier(app, module)
{
  const RESOLVED_STATUSES = {
    TECO: true,
    CNF: true,
    DLV: true
  };

  let checkInProgress = false;
  let checkCancelled = false;
  const checkCallbacks = [];

  module.checkOrders = checkOrders;

  app.broker.subscribe('orders.synced', () => checkOrders());

  function cancelCheckOrders()
  {
    checkCancelled = true;
  }

  function checkOrders(done)
  {
    if (_.isFunction(done))
    {
      checkCallbacks.push(done);
    }

    if (checkInProgress)
    {
      cancelCheckOrders();

      return;
    }

    checkInProgress = true;

    const startedAt = new Date();
    const mysql = app[module.config.mysqlId];
    const mongoose = app[module.config.mongooseId];
    const Order = mongoose.model('Order');
    const InvalidOrder = mongoose.model('InvalidOrder');

    step(
      function findSettingsStep()
      {
        findSettings(this.next());
      },
      function findExistingInvalidOrdersStep(err, settings)
      {
        if (checkCancelled || err)
        {
          return this.skip(err);
        }

        this.settings = settings;

        InvalidOrder.find({status: 'invalid'}).lean().exec(this.next());
      },
      function findOrdersToCheckStep(err, invalidOrders)
      {
        if (checkCancelled || err)
        {
          return this.skip(err);
        }

        this.invalidOrders = _.keyBy(invalidOrders, '_id');

        const from = moment().startOf('day');

        while (businessDays.countInDay(from.toDate()) === 0)
        {
          from.subtract(1, 'days');
        }

        const to = from.clone();
        let businessDayCount = 0;

        while (businessDayCount !== this.settings.toBusinessDays)
        {
          to.add(1, 'days');

          businessDayCount += businessDays.countInDay(to.toDate());
        }

        this.toTime = to.valueOf();

        const invalidOrderIds = _.keys(this.invalidOrders);
        const conditions = {
          _id: {
            $nin: invalidOrderIds
          },
          mrp: {
            $in: this.settings.mrps
          },
          startDate: {
            $gte: from.toDate(),
            $lte: to.toDate()
          },
          statuses: {
            $eq: 'REL',
            $ne: 'TECO'
          },
          'operations.name': /monta|prog/i
        };
        const fields = {
          mrp: 1,
          statuses: 1,
          qty: 1,
          'qtyDone.total': 1,
          startDate: 1
        };

        Order.find(conditions, fields).lean().exec(this.parallel());

        Order.find({_id: {$in: invalidOrderIds}}, fields).lean().exec(this.parallel());
      },
      function connectToMysqlStep(err, ordersToCheck, invalidOrdersToCheck)
      {
        if (checkCancelled || err)
        {
          return this.skip(err);
        }

        if (!ordersToCheck.length && !invalidOrdersToCheck.length)
        {
          return this.skip();
        }

        this.orders = {};

        ordersToCheck.forEach(o => { this.orders[o._id] = o; });

        invalidOrdersToCheck.forEach(o => { this.orders[o._id] = o; });

        mysql.pool.getConnection(this.next());
      },
      function findIptOrdersStep(err, conn)
      {
        if (checkCancelled || err)
        {
          return this.skip(err);
        }

        this.mysql = conn;

        const sql = `
          SELECT po.order_id AS orderNo, COUNT(op.id) AS operationCount
          FROM productionorder po
          LEFT JOIN operation op ON po.id=op.production_order_id
          WHERE po.order_id IN(${_.keys(this.orders).join(',')})
            AND op.disabledTimestamp IS NULL
          GROUP BY po.order_id
        `;

        conn.query(sql, this.next());
      },
      function groupIptResultsStep(err, results)
      {
        if (checkCancelled || err)
        {
          return this.skip(err);
        }

        if (this.mysql)
        {
          this.mysql.release();
          this.mysql = null;
        }

        const operationCount = {};

        this.notifyOrders = {};
        this.missingOrders = {};
        this.emptyOrders = {};
        this.resolvedOrders = {};
        this.delayedOrders = {};

        results.forEach(result =>
        {
          operationCount[result.orderNo] = result.operationCount;
        });

        _.forEach(this.orders, o =>
        {
          if (o.startDate > this.toTime)
          {
            this.delayedOrders[o._id] = true;
            this.notifyOrders[o._id] = true;
          }
          else if (o.qtyDone.total >= o.qty)
          {
            this.resolvedOrders[o._id] = 'DONE';
          }
          else if (o.statuses.some(s => RESOLVED_STATUSES[s]))
          {
            this.resolvedOrders[o._id] = 'STATUS';
          }
          else if (operationCount[o._id] === undefined)
          {
            this.missingOrders[o._id] = o;
          }
          else if (operationCount[o._id] === 0)
          {
            this.emptyOrders[o._id] = o;
          }
          else
          {
            this.resolvedOrders[o._id] = 'OPERATIONS';
          }
        });

        setImmediate(this.next());
      },
      function handleDelayedOrdersStep()
      {
        const conditions = {
          _id: {$in: _.keys(this.delayedOrders)}
        };

        if (conditions._id.$in.length)
        {
          InvalidOrder.remove(conditions, this.next());
        }
      },
      function findIgnoredOrdersStep(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        const conditions = {
          _id: {
            $in: _.keys(this.missingOrders).concat(_.keys(this.emptyOrders))
          },
          status: 'ignored'
        };

        if (conditions._id.$in.length)
        {
          InvalidOrder.find(conditions, {_id: 1}).lean().exec(this.next());
        }
      },
      function handleIgnoredOrdersStep(err, ignoredOrders)
      {
        if (err)
        {
          return this.skip(err);
        }

        ignoredOrders.forEach(o =>
        {
          delete this.missingOrders[o._id];
          delete this.emptyOrders[o._id];
        });
      },
      function handleResolvedOrdersStep()
      {
        _.forEach(this.resolvedOrders, (solution, orderNo) =>
        {
          const invalidOrder = this.invalidOrders[orderNo];

          if (!invalidOrder)
          {
            return;
          }

          InvalidOrder.collection.update({_id: orderNo}, {$set: {
            updatedAt: startedAt,
            updater: null,
            status: 'resolved',
            solution
          }}, this.group());
        });
      },
      function handleMissingOrdersStep(err)
      {
        if (checkCancelled || err)
        {
          return this.skip(err);
        }

        const update = [];
        const insert = [];

        _.forEach(this.missingOrders, missingOrder =>
        {
          const invalidOrder = this.invalidOrders[missingOrder._id];

          if (invalidOrder)
          {
            update.push(missingOrder._id);
          }
          else
          {
            this.notifyOrders[missingOrder._id] = true;

            insert.push({
              _id: missingOrder._id,
              updatedAt: startedAt,
              updater: null,
              mrp: missingOrder.mrp,
              status: 'invalid',
              problem: 'MISSING',
              solution: '',
              iptStatus: '',
              iptComment: ''
            });
          }
        });

        if (update.length)
        {
          InvalidOrder.collection.update({_id: {$in: update}}, {$set: {
            updatedAt: startedAt,
            updater: null,
            problem: 'MISSING'
          }}, {multi: true}, this.parallel());
        }

        if (insert.length)
        {
          InvalidOrder.collection.insert(insert, this.parallel());
        }
      },
      function(err)
      {
        if (checkCancelled || err)
        {
          return this.skip(err);
        }

        _.forEach(this.emptyOrders, emptyOrder =>
        {
          const invalidOrder = this.invalidOrders[emptyOrder._id];

          if (!invalidOrder)
          {
            this.notifyOrders[emptyOrder._id] = true;
          }

          runIptCheck({
            _id: emptyOrder._id,
            updatedAt: startedAt,
            updater: null,
            mrp: emptyOrder.mrp,
            status: 'invalid',
            problem: 'EMPTY',
            solution: '',
            iptStatus: invalidOrder ? invalidOrder.iptStatus : '',
            iptComment: invalidOrder ? invalidOrder.iptComment : ''
          }, this.group());
        });
      },
      function finalizeStep(err)
      {
        checkInProgress = false;

        const count = Object.keys(this.notifyOrders || {}).length;

        if (count)
        {
          app.broker.publish('orders.invalid.synced', {
            timestamp: startedAt,
            count
          });
        }

        if (this.mysql)
        {
          this.mysql.release();
          this.mysql = null;
        }

        if (checkCancelled)
        {
          module.debug(`Checking cancelled in ${Date.now() - startedAt} ms!`);

          checkCancelled = false;

          return setImmediate(checkOrders);
        }

        if (err)
        {
          module.error(`Checking failed in ${Date.now() - startedAt} ms: ${err.message}`);
        }
        else
        {
          module.debug(`Checking done in ${Date.now() - startedAt} ms!`);
        }

        while (checkCallbacks.length)
        {
          (checkCallbacks.shift())(err);
        }
      }
    );
  }

  function runIptCheck(invalidOrder, done)
  {
    step(
      function getIptCheckResultPageStep()
      {
        request.get(
          module.config.iptUrl.replace('${order}', invalidOrder._id),
          {timeout: 60000},
          this.next()
        );
      },
      function(err, res, body)
      {
        if (checkCancelled)
        {
          return this.skip();
        }

        if (err)
        {
          if (invalidOrder.iptStatus === '')
          {
            invalidOrder.iptStatus = 'Order check request failure';
            invalidOrder.iptComment = err.message;
          }

          return;
        }

        if (res.statusCode !== 200)
        {
          if (invalidOrder.iptStatus === '')
          {
            invalidOrder.iptStatus = 'Order check request failure';
            invalidOrder.iptComment = 'Expected HTTP status code 200, got: ' + res.statusCode;
          }

          return;
        }

        const $ = cheerio.load(body);

        invalidOrder.iptStatus = $('.status-message > span').first().text().trim()
          .replace('Comment: ', '')
          .replace('↑ ', '');
        invalidOrder.iptComment = $('.comment').first().text().trim()
          .replace('Comment: ', '')
          .replace('↑ ', '');
      },
      function saveInvalidOrderStep()
      {
        if (checkCancelled)
        {
          return done();
        }

        app[module.config.mongooseId].model('InvalidOrder').collection.update(
          {_id: invalidOrder._id},
          invalidOrder,
          {upsert: true},
          done
        );
      }
    );
  }

  function findSettings(done)
  {
    const settingsModule = app[module.config.settingsId];

    step(
      function()
      {
        settingsModule.findValues('orders.iptChecker.', this.parallel());
      },
      function(err, settings)
      {
        if (err)
        {
          return this.skip(err);
        }

        this.settings = {
          toBusinessDays: _.isNumber(settings.toBusinessDays) && settings.toBusinessDays ? settings.toBusinessDays : 2,
          mrps: (Array.isArray(settings.mrps) ? settings.mrps : []).filter(mrp => /^[A-Z0-9*]{3}$/.test(mrp))
        };

        if (this.settings.mrps.some(mrp => mrp.includes('*')))
        {
          expandMrps(this.settings, this.next());
        }
      },
      function(err)
      {
        done(err, this.settings);
      }
    );
  }

  function expandMrps(settings, done)
  {
    app[module.config.mongooseId].model('Order').collection.distinct('mrp', function(err, allMrps)
    {
      if (err)
      {
        return done(err);
      }

      const mrps = [];

      settings.mrps.forEach(mrp =>
      {
        if (!mrp.includes('*'))
        {
          mrps.push(mrp);

          return;
        }

        try
        {
          const pattern = new RegExp(`^${_.escapeRegExp(mrp).replace(/\\\*/g, '.*?')}$`);

          allMrps
            .filter(mrp => pattern.test(mrp))
            .forEach(mrp => mrps.push(mrp));
        }
        catch (err)
        {
          module.warn(`Invalid MRP pattern: ${mrp}`);
        }
      });

      done();
    });
  }
};
