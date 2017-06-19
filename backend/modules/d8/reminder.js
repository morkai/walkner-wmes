// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const fs = require('fs');
const _ = require('lodash');
const step = require('h5.step');
const ejs = require('ejs');
const moment = require('moment');
const businessDays = require('../reports/businessDays');

module.exports = function setUpD8Reminder(app, module)
{
  if (!module.config.remind)
  {
    return;
  }

  const mailSender = app[module.config.mailSenderId];
  const mongoose = app[module.config.mongooseId];
  const User = mongoose.model('User');
  const D8Entry = mongoose.model('D8Entry');

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
    const now = Date.now();
    const next = moment(now);
    const hour = next.hours();

    next.hours(12).startOf('hour');

    if (hour >= 12)
    {
      next.add(1, 'days');
    }

    setTimeout(remind, next.diff(now));
  }

  function remind()
  {
    step(
      function checkBusinessDayStep()
      {
        if (!businessDays.countInDay(new Date()))
        {
          module.debug("[reminder] Skipping a non-business day.");

          this.skip();
        }
      },
      function findOpenEntriesStep()
      {
        D8Entry.find({status: 'open'}, {changes: 0}).lean().exec(this.next());
      },
      function getUserDataStep(err, entries)
      {
        if (err)
        {
          return this.skip(err);
        }

        module.debug("[reminder] Found %d open entries.", entries.length);

        this.entries = _.filter(entries, function(entry)
        {
          if (entry.duration < 10)
          {
            return false;
          }

          if (entry.duration === 10)
          {
            entry.mode = 'verification';
          }
          else if (entry.duration === 20)
          {
            entry.mode = 'd5Start';
          }
          else if (entry.duration === 24)
          {
            entry.mode = 'warning';
          }
          else if (entry.duration === 28)
          {
            entry.mode = 'late';
          }
          else if (entry.duration === 35 || entry.duration === 42)
          {
            entry.mode = 'veryLate';
          }
          else
          {
            return false;
          }

          return true;
        });

        if (!this.entries.length)
        {
          return this.skip();
        }

        this.entries = entries;

        const userIds = {};

        _.forEach(entries, function(entry)
        {
          _.forEach(entry.observers, function(observer)
          {
            userIds[observer.user.id] = 1;
          });
        });

        const conditions = {
          _id: {$in: Object.keys(userIds)},
          email: {$ne: null}
        };
        const fields = {
          email: 1
        };

        User.find(conditions, fields).lean().exec(this.next());
      },
      function sendEmailsStep(err, users)
      {
        if (err)
        {
          return this.skip(err);
        }

        const userToEmailMap = {};

        _.forEach(users, function(user)
        {
          userToEmailMap[user._id] = user.email;
        });

        module.debug("[reminder] Sending reminders for %d entries.", this.entries.length);

        _.forEach(this.entries, function(entry)
        {
          const emails = entry.observers.map(observer => userToEmailMap[observer.user.id]).filter(email => !!email);

          sendReminderEmail(entry, emails);
        });
      },
      function(err)
      {
        if (err)
        {
          module.error("[reminder] %s", err.message);
        }

        this.entries = null;

        setTimeout(scheduleNextReminder, 10000);
      }
    );
  }

  function sendReminderEmail(entry, emails)
  {
    step(
      function()
      {
        module.prepareTemplateData(entry.mode, entry, this.next());
      },
      function(err, templateData)
      {
        if (err)
        {
          return this.skip(err);
        }

        const mailOptions = {
          to: emails,
          replyTo: emails,
          subject: `[WMES] [8D] Niezakończone zgłoszenie: ${entry.rid} (${entry.duration} dni)`,
          html: renderEmail(templateData)
        };

        mailSender.send(mailOptions, this.next());
      },
      function(err)
      {
        if (err)
        {
          module.error("[reminder] Failed to remind [%s]: %s", emails, err.message);
        }
      }
    );
  }
};
