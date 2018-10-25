// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const fs = require('fs');
const _ = require('lodash');
const step = require('h5.step');
const ejs = require('ejs');
const moment = require('moment');

module.exports = function setUpKaizenReminder(app, kaizenModule)
{
  if (!kaizenModule.config.remind)
  {
    return;
  }

  const mailSender = app[kaizenModule.config.mailSenderId];
  const mongoose = app[kaizenModule.config.mongooseId];
  const User = mongoose.model('User');
  const KaizenOrder = mongoose.model('KaizenOrder');

  const DAYS_AGO = kaizenModule.config.remind;
  const EMAIL_URL_PREFIX = kaizenModule.config.emailUrlPrefix;

  const emailTemplateFile = __dirname + '/reminder.email.pl.ejs';
  const renderEmail = ejs.compile(fs.readFileSync(emailTemplateFile, 'utf8'), {
    cache: true,
    filename: emailTemplateFile,
    compileDebug: false,
    rmWhitespace: true
  });

  app.broker.subscribe('app.started', scheduleNextReminder).setLimit(1);

  function scheduleNextReminder()
  {
    const delay = moment().hours(12).minutes(0).seconds(0).milliseconds(0).add(1, 'days').diff(Date.now());

    setTimeout(remind, delay);
  }

  function remind()
  {
    step(
      function aggregateStep()
      {
        const weekAgo = moment().subtract(DAYS_AGO, 'days').valueOf();

        this.conditions = {
          status: {$in: ['new', 'accepted', 'todo', 'inProgress', 'paused']},
          remindedAt: {$lt: weekAgo}
        };

        KaizenOrder.aggregate([
          {$match: this.conditions},
          {$group: {_id: '$confirmer.id', totalCount: {$sum: 1}}}
        ], this.parallel());

        KaizenOrder.aggregate([
          {$match: {
            status: {$in: ['new', 'accepted', 'todo', 'inProgress', 'paused']},
            updatedAt: {$lt: new Date(weekAgo)}
          }},
          {$group: {_id: '$confirmer.id', totalCount: {$sum: 1}}}
        ], this.parallel());
      },
      function getUserDataStep(err, remindedAtResults, updatedAtResults)
      {
        if (err)
        {
          return this.skip(err);
        }

        const updatedAtStats = {};

        _.forEach(updatedAtResults, function(result)
        {
          updatedAtStats[result._id] = result;
        });

        const userIds = [];
        const userIdToStats = {};

        _.forEach(remindedAtResults, function(result)
        {
          userIds.push(new mongoose.Types.ObjectId(result._id));
          userIdToStats[result._id] = updatedAtStats[result._id];
        });

        this.userIdToStats = userIdToStats;

        const conditions = {_id: {$in: userIds}, email: {$ne: null}};
        const fields = {firstName: 1, lastName: 1, email: 1, gender: 1};

        User.find(conditions, fields).exec(this.next());
      },
      function sendEmailsStep(err, users)
      {
        if (err)
        {
          return this.skip(err);
        }

        for (let i = 0; i < users.length; ++i)
        {
          const user = users[i];

          sendReminderEmail(users[i], this.userIdToStats[user._id]);
        }

        kaizenModule.info('Reminded %d users about incomplete orders.', users.length);
      },
      function updateUpdatedAtStep()
      {
        KaizenOrder.updateMany(this.conditions, {$set: {remindedAt: Date.now()}}, this.next());
      },
      function(err)
      {
        if (err)
        {
          kaizenModule.error('[reminder] %s', err.message);
        }

        this.conditions = null;
        this.userIdToStats = null;

        scheduleNextReminder();
      }
    );
  }

  function sendReminderEmail(user, stats)
  {
    const mailOptions = {
      to: user.email,
      replyTo: user.email,
      subject: '[WMES] Niezakończone zgłoszenia ZPW',
      html: renderEmail({
        urlPrefix: EMAIL_URL_PREFIX,
        user: user,
        plural: plural(stats.totalCount),
        totalCount: stats.totalCount
      })
    };

    mailSender.send(mailOptions, function(err)
    {
      if (err)
      {
        module.error('Failed to remind [%s] about incomplete suggestions: %s', mailOptions.to, err.message);
      }
    });
  }

  function plural(n)
  {
    return (n % 10 < 5) && (n % 10 > 1) && ((~~(n / 10) % 10) !== 1);
  }
};
