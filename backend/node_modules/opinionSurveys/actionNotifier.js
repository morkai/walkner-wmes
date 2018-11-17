// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');

module.exports = function setUpActionNotifier(app, module)
{
  const mailSender = app[module.config.mailSenderId];
  const mongoose = app[module.config.mongooseId];
  const User = mongoose.model('User');

  const EMAIL_URL_PREFIX = module.config.emailUrlPrefix;

  app.broker.subscribe('opinionSurveys.actions.added', function(message)
  {
    notifyAboutAdd(message.model);
  });

  app.broker.subscribe('opinionSurveys.actions.edited', function(message)
  {
    notifyAboutEdit(message.model);
  });

  function notifyAboutAdd(survey)
  {
    const recipients = _.without(survey.participants, survey.creator.id);
    const subject = 'Badanie Opinia - Nowa akcja naprawcza #' + survey.rid;
    const text = [
      'Witaj!',
      '',
      'Nowa akcja naprawcza #' + survey.rid
        + ', w której uczestniczysz, została przed chwilą dodana przez: ' + survey.creator.label,

      'Dodana akcja naprawcza: ' + EMAIL_URL_PREFIX + 'r/opinion/' + survey.rid,
      'Wszystkie akcje naprawcze: ' + EMAIL_URL_PREFIX + 'r/opinions',

      'Ta wiadomość została wygenerowana automatycznie przez system WMES.'
    ];

    sendMail(survey.rid, recipients, subject, text);
  }

  function notifyAboutEdit(survey)
  {
    const recipients = _.without(survey.participants, survey.updater.id);
    const subject = 'Badanie Opinia - Edycja akcji naprawczej #' + survey.rid;
    const text = [
      'Witaj!',
      '',
      'Akcja naprawcza #' + survey.rid
      + ', w której uczestniczysz, została przed chwilą zmodyfikowana przez: ' + survey.updater.label,

      'Zmieniona akcja naprawcza: ' + EMAIL_URL_PREFIX + 'r/opinion/' + survey.rid,
      'Wszystkie akcje naprawcze: ' + EMAIL_URL_PREFIX + 'r/opinions',

      'Ta wiadomość została wygenerowana automatycznie przez system WMES.'
    ];

    sendMail(survey.rid, recipients, subject, text.join('\t\r\n'));
  }

  function sendMail(rid, recipients, subject, text)
  {
    const userIds = recipients.map(function(userId) { return new mongoose.Types.ObjectId(userId); });

    step(
      function findUsersStep()
      {
        User.find({_id: {$in: userIds}}, {email: 1}).lean().exec(this.next());
      },
      function sendMailStep(err, users)
      {
        if (err)
        {
          return this.skip(err);
        }

        recipients = users
          .map(function(user) { return user.email; })
          .filter(function(email) { return _.includes(email, '@'); });

        if (!recipients.length)
        {
          return this.skip(new Error('No valid recipients.'));
        }

        const mailOptions = {
          to: recipients,
          replyTo: recipients,
          subject: subject,
          text: text
        };

        mailSender.send(mailOptions, this.next());
      },
      function finalizeStep(err)
      {
        if (err)
        {
          module.error('Failed to notify users about action #%d: %s', rid, err.message);
        }
      }
    );
  }
};
