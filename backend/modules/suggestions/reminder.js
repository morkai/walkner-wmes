// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var fs = require('fs');
var _ = require('lodash');
var step = require('h5.step');
var ejs = require('ejs');
var moment = require('moment');

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

  var emailTemplateFile = __dirname + '/reminder.email.pl.ejs';
  var renderEmail = ejs.compile(fs.readFileSync(emailTemplateFile, 'utf8'), {
    cache: true,
    filename: emailTemplateFile,
    compileDebug: false,
    rmWhitespace: true
  });

  app.broker.subscribe('app.started', scheduleNextReminder).setLimit(1);

  function scheduleNextReminder()
  {
    var delay = moment()
      .hours(12)
      .minutes(0)
      .seconds(0)
      .milliseconds(0)
      .add(1, 'days')
      .diff(Date.now());

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

          sendRemainderEmail(user, this.userIdToStats[user._id]);
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
    var mailOptions = {
      to: user.email,
      replyTo: user.email,
      subject: '[WMES] Niezakończone zgłoszenia usprawnień',
      html: renderEmail({
        urlPrefix: EMAIL_URL_PREFIX,
        user: user,
        plural: plural(stats.totalCount),
        totalCount: stats.totalCount
      })
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
