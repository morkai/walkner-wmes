// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var step = require('h5.step');

module.exports = function setUpKaizenNotifier(app, kaizenModule)
{
  var mailSender = app[kaizenModule.config.mailSenderId];
  var mongoose = app[kaizenModule.config.mongooseId];
  var User = mongoose.model('User');

  var TYPE_TRANSLATIONS = {
    nearMiss: 'ZPW',
    suggestion: 'Sugestia',
    kaizen: 'Kaizen'
  };
  var EMAIL_URL_PREFIX = kaizenModule.config.emailUrlPrefix;

  app.broker.subscribe('kaizen.orders.added', function(message)
  {
    notifyAboutAdd(message.model);
  });

  app.broker.subscribe('kaizen.orders.edited', function(message)
  {
    if (!_.isEmpty(message.notify))
    {
      notifyAboutEdit(message.model, message.notify);
    }
  });

  function notifyAboutAdd(kaizenOrder)
  {
    var recipients = [];

    _.forEach(kaizenOrder.observers, function(observer)
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
        var subject = '[WMES] Nowe zgłoszenie usprawnień: ' + kaizenOrder.rid;
        var text = [];

        text.push(
          'Użytkownik ' + kaizenOrder.creator.label + ' dodał nowe zgłoszenie usprawnienia i wybrał'
            + ' Ciebie jako jedną z osób zainteresowanych.',
          '',
          'ID zgłoszenia: ' + kaizenOrder.rid,
          'Rodzaj zgłoszenia: ' + translateTypes(kaizenOrder.types),
          'Temat zgłoszenia: ' + kaizenOrder.subject,
          '',
          'Dodane zgłoszenie: ' + EMAIL_URL_PREFIX + 'r/kaizen/' + kaizenOrder.rid,
          'Nieprzeczytane zgłoszenia: ' + EMAIL_URL_PREFIX + 'r/kaizens/unseen',
          'Twoje zgłoszenia: ' + EMAIL_URL_PREFIX + 'r/kaizens/mine',
          'Wszystkie zgłoszenia: ' + EMAIL_URL_PREFIX + 'r/kaizens/all',
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
          kaizenModule.error("Failed to notify users about a new order [%d]: %s", kaizenOrder.rid, err.message);
        }
        else if (this.mailOptions.to.length)
        {
          kaizenModule.info("Notified %d users about a new order: %d", this.mailOptions.to.length, kaizenOrder.rid);
        }

        this.mailOptions = null;
      }
    );
  }

  function notifyAboutEdit(kaizenOrder, usersToNotify)
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

        var subject = '[WMES] Zmienione zgłoszenie usprawnień: ' + kaizenOrder.rid;
        var text = [];

        text.push(
          'Użytkownik ' + kaizenOrder.updater.label + ' dokonał zmian w zgłoszeniu usprawnień, w którym jesteś osobą'
            + ' zainteresowaną.',
          '',
          'ID zgłoszenia: ' + kaizenOrder.rid,
          'Temat zgłoszenia: ' + kaizenOrder.subject,
          '',
          'Zmienione zgłoszenie: ' + EMAIL_URL_PREFIX + 'r/kaizen/' + kaizenOrder.rid,
          'Nieprzeczytane zgłoszenia: ' + EMAIL_URL_PREFIX + 'r/kaizens/unseen',
          'Twoje zgłoszenia: ' + EMAIL_URL_PREFIX + 'r/kaizens/mine',
          'Wszystkie zgłoszenia: ' + EMAIL_URL_PREFIX + 'r/kaizens/all',
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
          kaizenModule.error("Failed to notify users about an order change [%d]: %s", kaizenOrder.rid, err.message);
        }
        else if (this.mailOptions)
        {
          kaizenModule.info("Notified %d users about an order change: %d", this.mailOptions.to.length, kaizenOrder.rid);
        }

        this.mailOptions = null;
      }
    );
  }

  function translateTypes(types)
  {
    return types.map(function(type) { return TYPE_TRANSLATIONS[type]; });
  }
};
