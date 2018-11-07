// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
let heapdump = null;

try { heapdump = require('heapdump'); } catch (err) {} // eslint-disable-line no-empty

exports.DEFAULT_CONFIG = {
  mailSenderId: 'mail/sender',
  expressId: 'express',
  userId: 'user',
  printInterval: 10 * 60 * 1000,
  notifyThreshold: 600,
  notifyRecipients: [],
  dumpThreshold: Number.MAX_SAFE_INTEGER
};

exports.start = function startWatchdogMemoryUsageModule(app, module)
{
  module.time = 0;

  module.printTime = 0;

  module.notifyTime = 0;

  module.dumpTime = 0;

  module.last = {
    rss: 0,
    heapTotal: 0,
    heapUsed: 0,
    external: 0
  };

  module.min = {
    rss: Number.MAX_SAFE_INTEGER,
    heapTotal: Number.MAX_SAFE_INTEGER,
    heapUsed: Number.MAX_SAFE_INTEGER,
    external: Number.MAX_SAFE_INTEGER
  };

  module.max = {
    rss: 0,
    heapTotal: 0,
    heapUsed: 0,
    external: 0
  };

  module.diff = {
    rss: 0,
    heapTotal: 0,
    heapUsed: 0,
    external: 0
  };

  module.check = checkMemoryUsage;

  module.dump = dumpMemoryUsage;

  app.onModuleReady(module.config.expressId, setUpRoutes);

  app.broker.subscribe('app.started').setLimit(1).on('message', checkMemoryUsage);

  function checkMemoryUsage()
  {
    const now = Date.now();
    const {rss, heapTotal, heapUsed, external} = process.memoryUsage();
    const memoryUsage = {
      rss: Math.round(rss / 1024 / 1024),
      heapTotal: Math.round(heapTotal / 1024 / 1024),
      heapUsed: Math.round(heapUsed / 1024 / 1024),
      external: Math.round(external / 1024 / 1024)
    };

    Object.keys(memoryUsage).forEach(k =>
    {
      module.diff[k] = memoryUsage[k] - module.last[k];

      if (memoryUsage[k] > module.max[k])
      {
        module.max[k] = memoryUsage[k];
      }

      if (memoryUsage[k] < module.min[k])
      {
        module.min[k] = memoryUsage[k];
      }
    });

    if (now - module.printTime >= module.config.printInterval
      || module.diff.rss > 25 || module.diff.rss <= -100
      || module.diff.heapTotal > 25 || module.diff.heapTotal <= -100
      || module.diff.heapUsed > 25 || module.diff.heapUsed <= -100
      || module.diff.external > 25 || module.diff.external <= -50)
    {
      module.debug('');
      printMemoryUsage('NOW ', memoryUsage);
      printMemoryUsage('LAST', module.last);
      printMemoryUsage('DIFF', module.diff);
      printMemoryUsage('MIN ', module.min);
      printMemoryUsage('MAX ', module.max);

      module.printTime = now;
    }

    module.last = memoryUsage;
    module.time = now;

    if (memoryUsage.rss > module.config.notifyThreshold
      && now - module.notifyTime > 3600 * 4 * 1000)
    {
      notifyMemoryUsage();
    }

    if (memoryUsage.heapTotal > module.config.dumpThreshold
      && now - module.dumpTime > 3600 * 8 * 1000)
    {
      dumpMemoryUsage();
    }

    setTimeout(checkMemoryUsage, 10000);
  }

  function printMemoryUsage(label, {rss, heapTotal, heapUsed, external})
  {
    console.log(`${label} rss=${rss}\theapTotal=${heapTotal}\theapUsed=${heapUsed}\texternal=${external}`);
  }

  function notifyMemoryUsage()
  {
    if (global.gc)
    {
      global.gc();
    }

    const mailSender = app[module.config.mailSenderId];

    if (!mailSender || _.isEmpty(module.config.notifyRecipients))
    {
      return;
    }

    const mailOptions = {
      to: module.config.notifyRecipients,
      subject: `[WMES] High memory usage >=${module.last.rss} on [${app.options.id}]`,
      text: JSON.stringify(_.pick(module, ['last', 'min', 'max', 'diff']), null, 2)
    };

    mailSender.send(mailOptions, err =>
    {
      if (err)
      {
        module.error(`Failed to notify: ${err.message}`);
      }
    });

    module.notifyTime = Date.now();
  }

  function dumpMemoryUsage(done)
  {
    if (global.gc)
    {
      global.gc();
    }

    if (!heapdump)
    {
      return done && done(app.createError(`No heapdump module!`));
    }

    heapdump.writeSnapshot((err, file) =>
    {
      if (err)
      {
        module.error(`Failed to dump the heap: ${err.message}`);
      }
      else
      {
        module.debug(`Heap dump written to: ${process.cwd()}/${file}`);
      }

      if (done)
      {
        done(err, `${process.cwd()}/${file}`);
      }
    });

    module.dumpTime = Date.now();
  }

  function setUpRoutes()
  {
    const express = app[module.config.expressId];
    const auth = app[module.config.userId].auth('SUPER');

    express.get('/watchdog/memoryUsage/gc', auth, (req, res) =>
    {
      if (global.gc)
      {
        global.gc();
      }

      res.sendStatus(204);
    });

    express.get('/watchdog/memoryUsage/check', auth, (req, res) =>
    {
      checkMemoryUsage();

      res.json(_.pick(module, ['last', 'min', 'max', 'diff']));
    });

    express.get('/watchdog/memoryUsage/dump', auth, (req, res, next) =>
    {
      dumpMemoryUsage((err, file) =>
      {
        if (err)
        {
          return next(err);
        }

        res.json({file});
      });
    });
  }
};
