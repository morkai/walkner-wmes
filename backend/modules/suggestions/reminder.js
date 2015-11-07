// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var moment = require('moment');
var step = require('h5.step');

module.exports = function setUpSuggestionsReminder(app, module)
{
  if (!module.config.remind)
  {
    return;
  }

  var mailSender = app[module.config.mailSenderId];
  var mongoose = app[module.config.mongooseId];
  var User = mongoose.model('User');
  var Suggestion = mongoose.model('Suggestion');

  var DAYS_AGO = module.config.remind;
  var EMAIL_URL_PREFIX = module.config.emailUrlPrefix;

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
        var weekAgo = moment().subtract(DAYS_AGO, 'days').valueOf();

        this.conditions = {
          status: {$in: ['new', 'accepted', 'todo', 'inProgress', 'paused']},
          remindedAt: {$lt: weekAgo}
        };

        Suggestion.aggregate([
          {$match: this.conditions},
          {$group: {_id: '$confirmer.id', totalCount: {$sum: 1}}}
        ], this.parallel());

        Suggestion.aggregate([
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

        var updatedAtStats = {};

        _.forEach(updatedAtResults, function(result)
        {
          updatedAtStats[result._id] = result;
        });

        var userIds = [];
        var userIdToStats = {};

        _.forEach(remindedAtResults, function(result)
        {
          userIds.push(new mongoose.Types.ObjectId(result._id));
          userIdToStats[result._id] = updatedAtStats[result._id];
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

        module.info("Reminded %d users about incomplete suggestions.", users.length);
      },
      function updateUpdatedAtStep()
      {
        Suggestion.update(this.conditions, {$set: {remindedAt: Date.now()}}, {multi: true}, this.next());
      },
      function(err)
      {
        if (err)
        {
          module.error("[reminder] %s", err.message);
        }

        this.conditions = null;
        this.userIdToStats = null;
      }
    );
  }

  function sendRemainderEmail(user, stats)
  {
    var subject = '[WMES] Niezakończona sugestia';
    var text = [
      'Witaj, ' + user.firstName + ' ' + user.lastName + '!',
      ''
    ];

    if (stats.totalCount === 1)
    {
      text.push(
        'Dostajesz tę wiadomość, ponieważ masz jedną niezakończoną sugestię,'
          + ' która od pewnego czasu nie była aktualizowana.'
      );
    }
    else if (plural(stats.totalCount))
    {
      text.push(
        'Dostajesz tę wiadomość, ponieważ masz ' + stats.totalCount + ' niezakończone sugestie,'
        + ' które od pewnego czasu nie były aktualizowane.'
      );
    }
    else
    {
      text.push(
        'Dostajesz tę wiadomość, ponieważ masz ' + stats.totalCount + ' niezakończonych sugestii,'
        + ' które od pewnego czasu nie były aktualizowane.'
      );
    }

    text.push(
      '',
      'Prosimy o zmianę statusu zgłoszenia na Zakończone, jeżeli zostało ono już zrealizowane.',
      '',
      'Nieprzeczytane zgłoszenia: ' + EMAIL_URL_PREFIX + 'r/suggestions/unseen',
      'Twoje zgłoszenia: ' + EMAIL_URL_PREFIX + 'r/suggestions/mine',
      'Wszystkie zgłoszenia: ' + EMAIL_URL_PREFIX + 'r/suggestions/all',
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
        module.error("Failed to remind [%s] about incomplete suggestions: %s", mailOptions.to, err.message);
      }
    });
  }

  function plural(n)
  {
    return (n % 10 < 5) && (n % 10 > 1) && ((~~(n / 10) % 10) !== 1);
  }
};
