// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var moment = require('moment');
var step = require('h5.step');

module.exports = function setUpKaizenReminder(app, kaizenModule)
{
  if (!kaizenModule.config.remind)
  {
    return;
  }

  var mailSender = app[kaizenModule.config.mailSenderId];
  var mongoose = app[kaizenModule.config.mongooseId];
  var User = mongoose.model('User');
  var KaizenOrder = mongoose.model('KaizenOrder');

  var DAYS_AGO = 7;
  var EMAIL_URL_PREFIX = kaizenModule.config.emailUrlPrefix;

  app.broker.subscribe('app.started', scheduleNextReminder).setLimit(1);

  function scheduleNextReminder()
  {
    var delay = moment().hours(12).minutes(0).seconds(0).milliseconds(0).add(1, 'days').diff(Date.now());

    setTimeout(remind, delay);
  }

  function remind()
  {
    step(
      function aggregateStep()
      {
        this.conditions = {
          status: {$in: ['new', 'accepted', 'todo', 'inProgress', 'paused']},
          remindedAt: {$lt: moment().subtract(DAYS_AGO, 'days').valueOf()}
        };

        var pipeline = [
          {$match: this.conditions},
          {
            $group: {
              _id: '$confirmer.id',
              totalCount: {$sum: 1},
              newCount: {$sum: {$cond: {if: {$eq: ['$status', 'new']}, then: 1, else: 0}}},
              acceptedCount: {$sum: {$cond: {if: {$eq: ['$status', 'accepted']}, then: 1, else: 0}}},
              todoCount: {$sum: {$cond: {if: {$eq: ['$status', 'todo']}, then: 1, else: 0}}},
              inProgressCount: {$sum: {$cond: {if: {$eq: ['$status', 'inProgress']}, then: 1, else: 0}}},
              pausedCount: {$sum: {$cond: {if: {$eq: ['$status', 'paused']}, then: 1, else: 0}}}
            }
          }
        ];

        KaizenOrder.aggregate(pipeline, this.next());
      },
      function getUserDataStep(err, results)
      {
        if (err)
        {
          return this.skip(err);
        }

        var userIds = [];
        var userIdToStats = {};

        _.forEach(results, function(result)
        {
          userIds.push(new mongoose.Types.ObjectId(result._id));
          userIdToStats[result._id] = result;
        });

        this.userIdToStats = userIdToStats;

        var conditions = {_id: {$in: userIds}, email: {$ne: null}};
        var fields = {firstName: 1, lastName: 1, email: 1, gender: 1};

        User.find(conditions, fields).exec(this.next());
      },
      function sendEmailsStep(err, users)
      {
        if (err)
        {
          return this.skip(err);
        }

        for (var i = 0; i < users.length; ++i)
        {
          var user = users[i];

          sendRemainderEmail(users[i], this.userIdToStats[user._id]);
        }

        kaizenModule.info("Reminded %d users about incomplete orders.", users.length);
      },
      function updateUpdatedAtStep()
      {
        var update = {
          $inc: {remindedAt: Date.now()}
        };

        KaizenOrder.update(this.conditions, update, {multi: true}, this.next());
      },
      function(err)
      {
        if (err)
        {
          kaizenModule.error("[reminder] %s", err.message);
        }

        this.conditions = null;
        this.userIdToStats = null;
      }
    );
  }

  function sendRemainderEmail(user, stats)
  {
    var subject = '[WMES] Niezakończone zgłoszenia usprawnień';
    var text = [
      'Witaj, ' + user.firstName + ' ' + user.lastName + '!',
      ''
    ];

    if (stats.totalCount === 1)
    {
      text.push(
        'Dostajesz tę wiadomość, ponieważ masz jedno niezakończone zgłoszenie usprawnień (ZPW),'
          + ' które od pewnego czasu nie było aktualizowane.'
      );
    }
    else if (stats.totalCount < 5)
    {
      text.push(
        'Dostajesz tę wiadomość, ponieważ masz ' + stats.totalCount + ' niezakończone zgłoszenia usprawnień (ZPW),'
        + ' które od pewnego czasu nie były aktualizowane.'
      );
    }
    else
    {
      text.push(
        'Dostajesz tę wiadomość, ponieważ masz ' + stats.totalCount + ' niezakończonych zgłoszeń usprawnień (ZPW),'
        + ' które od pewnego czasu nie były aktualizowane.'
      );
    }

    text.push(
      '',
      'Prosimy o zmianę statusu zgłoszenia na Zakończone, jeżeli zostało ono już zrealizowane.',
      '',
      'Nieprzeczytane zgłoszenia: ' + EMAIL_URL_PREFIX + 'r/kaizens/unseen',
      'Twoje zgłoszenia: ' + EMAIL_URL_PREFIX + 'r/kaizens/mine',
      'Wszystkie zgłoszenia: ' + EMAIL_URL_PREFIX + 'r/kaizens/all',
      '',
      'Ta wiadomość została wygenerowana automatycznie przez system WMES.'
    );

    var mailOptions = {
      to: user.email,
      replyTo: user.email,
      subject: subject,
      text: text.join('\t\r\n')
    };

    mailSender.send(mailOptions, function (err)
    {
      if (err)
      {
        kaizenModule.error("Failed to remind [%s] about incomplete orders: %s", mailOptions.to, err.message);
      }
    });
  }
};
