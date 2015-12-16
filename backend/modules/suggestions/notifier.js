// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var step = require('h5.step');

module.exports = function setUpSuggestionsNotifier(app, module)
{
  var mailSender = app[module.config.mailSenderId];
  var mongoose = app[module.config.mongooseId];
  var User = mongoose.model('User');
  var Suggestion = mongoose.model('Suggestion');

  var EMAIL_URL_PREFIX = module.config.emailUrlPrefix;

  app.broker.subscribe(Suggestion.TOPIC_PREFIX + '.added', function(message)
  {
    notifyAboutAdd(message.model);
  });

  app.broker.subscribe(Suggestion.TOPIC_PREFIX + '.edited', function(message)
  {
    if (!_.isEmpty(message.notify))
    {
      notifyAboutEdit(message.model, message.notify);
    }
  });

  function notifyAboutAdd(suggestion)
  {
    var recipients = [];

    _.forEach(suggestion.observers, function(observer)
    {
      if (observer.role !== 'creator')
      {
        recipients.push(new mongoose.Types.ObjectId(observer.user.id));
      }
    });

    if (!recipients.length)
    {
      return;
    }

    step(
      function findRecipientsStep()
      {
        User.find({_id: {$in: recipients}}, {email: 1}).lean().exec(this.next());
      },
      function sendEmailStep(err, recipients)
      {
        if (err)
        {
          return this.skip(err);
        }

        var to = recipients
          .filter(function(recipient) { return _.isString(recipient.email) && recipient.email.indexOf('@') !== -1; })
          .map(function(recipient) { return recipient.email; });
        var subject = '[WMES] Nowa sugestia: ' + suggestion.rid;
        var text = [];

        text.push(
          'Użytkownik ' + suggestion.creator.label + ' dodał nową sugestię i wybrał'
            + ' Ciebie jako jedną z osób zainteresowanych.',
          '',
          'ID zgłoszenia: ' + suggestion.rid,
          'Temat zgłoszenia: ' + suggestion.subject,
          '',
          'Dodane zgłoszenie: ' + EMAIL_URL_PREFIX + 'r/suggestion/' + suggestion.rid,
          'Nieprzeczytane zgłoszenia: ' + EMAIL_URL_PREFIX + 'r/suggestions/unseen',
          'Twoje zgłoszenia: ' + EMAIL_URL_PREFIX + 'r/suggestions/mine',
          'Wszystkie zgłoszenia: ' + EMAIL_URL_PREFIX + 'r/suggestions/all',
          '',
          'Ta wiadomość została wygenerowana automatycznie przez system WMES.',
          'Nie dostaniesz kolejnych powiadomień o zmianach w tym zgłoszeniu, dopóki nie oznaczysz go jako przeczytane.'
        );

        this.mailOptions = {
          to: to,
          replyTo: to,
          subject: subject,
          text: text.join('\t\r\n')
        };

        if (to.length)
        {
          mailSender.send(this.mailOptions, this.next());
        }
      },
      function finalizeStep(err)
      {
        if (err)
        {
          module.error("Failed to notify users about a new suggestion [%d]: %s", suggestion.rid, err.message);
        }
        else if (this.mailOptions.to.length)
        {
          module.info("Notified %d users about a new suggestion: %d", this.mailOptions.to.length, suggestion.rid);
        }

        this.mailOptions = null;
      }
    );
  }

  function notifyAboutEdit(suggestion, usersToNotify)
  {
    var recipients = [];

    _.forEach(usersToNotify, function(changes, userId)
    {
      recipients.push(new mongoose.Types.ObjectId(userId));
    });

    if (!recipients.length)
    {
      return;
    }

    step(
      function findRecipientsStep()
      {
        User.find({_id: {$in: recipients}}, {email: 1}).lean().exec(this.next());
      },
      function sendEmailStep(err, recipients)
      {
        if (err)
        {
          return this.skip(err);
        }

        var to = recipients
          .filter(function(recipient) { return _.isString(recipient.email) && recipient.email.indexOf('@') !== -1; })
          .map(function(recipient) { return recipient.email; });

        if (!to.length)
        {
          return;
        }

        var subject = '[WMES] Zmieniona sugestia: ' + suggestion.rid;
        var text = [];

        text.push(
          'Użytkownik ' + suggestion.updater.label + ' dokonał zmian w sugestii, w której jesteś osobą'
            + ' zainteresowaną.',
          '',
          'ID zgłoszenia: ' + suggestion.rid,
          'Temat zgłoszenia: ' + suggestion.subject,
          '',
          'Zmienione zgłoszenie: ' + EMAIL_URL_PREFIX + 'r/suggestion/' + suggestion.rid,
          'Nieprzeczytane zgłoszenia: ' + EMAIL_URL_PREFIX + 'r/suggestions/unseen',
          'Twoje zgłoszenia: ' + EMAIL_URL_PREFIX + 'r/suggestions/mine',
          'Wszystkie zgłoszenia: ' + EMAIL_URL_PREFIX + 'r/suggestions/all',
          '',
          'Ta wiadomość została wygenerowana automatycznie przez system WMES.',
          'Nie dostaniesz kolejnych powiadomień o zmianach w tym zgłoszeniu, dopóki nie oznaczysz go jako przeczytane.'
        );

        this.mailOptions = {
          to: to,
          replyTo: to,
          subject: subject,
          text: text.join('\t\r\n')
        };

        mailSender.send(this.mailOptions, this.next());
      },
      function finalizeStep(err)
      {
        if (err)
        {
          module.error("Failed to notify users about a suggestion change [%d]: %s", suggestion.rid, err.message);
        }
        else if (this.mailOptions)
        {
          module.info("Notified %d users about a suggestion change: %d", this.mailOptions.to.length, suggestion.rid);
        }

        this.mailOptions = null;
      }
    );
  }
};
