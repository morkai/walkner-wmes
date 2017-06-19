// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const fs = require('fs');
const _ = require('lodash');
const step = require('h5.step');
const ejs = require('ejs');

module.exports = function setUpD8Notifier(app, module)
{
  const mailSender = app[module.config.mailSenderId];
  const mongoose = app[module.config.mongooseId];
  const User = mongoose.model('User');
  const D8Entry = mongoose.model('D8Entry');

  const emailTemplateFile = __dirname + '/notifier.email.pl.ejs';
  const renderEmail = ejs.compile(fs.readFileSync(emailTemplateFile, 'utf8'), {
    cache: true,
    filename: emailTemplateFile,
    compileDebug: false,
    rmWhitespace: true
  });

  app.broker.subscribe(D8Entry.TOPIC_PREFIX + '.added', function(message)
  {
    if (message.model.status !== 'closed')
    {
      notifyAboutAdd(message.model);
    }
  });

  app.broker.subscribe(D8Entry.TOPIC_PREFIX + '.edited', function(message)
  {
    if (!_.isEmpty(message.notify))
    {
      notifyAboutEdit(message.model, message.notify);
    }
  });

  function notifyAboutAdd(entry)
  {
    const recipients = [];

    _.forEach(entry.observers, function(observer)
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
      function findRecipientsAndNamesStep()
      {
        User.find({_id: {$in: recipients}}, {email: 1}).lean().exec(this.next());
      },
      function prepareTemplateDataStep(err, recipients)
      {
        if (err)
        {
          return this.skip(err);
        }

        const to = recipients
          .filter(function(recipient) { return _.isString(recipient.email) && recipient.email.indexOf('@') !== -1; })
          .map(function(recipient) { return recipient.email; });

        if (!to.length)
        {
          return this.skip();
        }

        this.mailOptions = {
          to: to,
          replyTo: to,
          subject: '[WMES] [8D] Nowy raport: ' + entry.rid,
          html: ''
        };

        return module.prepareTemplateData('add', entry, this.next());
      },
      function sendEmailStep(err, templateData)
      {
        if (err)
        {
          return this.skip(err);
        }

        this.mailOptions.html = renderEmail(templateData);

        mailSender.send(this.mailOptions, this.next());
      },
      function finalizeStep(err)
      {
        if (err)
        {
          module.error("Failed to notify users about a new 8D entry [%d]: %s", entry.rid, err.message);
        }
        else if (this.mailOptions)
        {
          module.info("Notified %d users about a new 8D entry: %d", this.mailOptions.to.length, entry.rid);
        }

        this.mailOptions = null;
      }
    );
  }

  function notifyAboutEdit(entry, usersToNotify)
  {
    const recipients = [];

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
      function prepareTemplateDataStep(err, recipients)
      {
        if (err)
        {
          return this.skip(err);
        }

        const to = recipients
          .filter(function(recipient) { return _.isString(recipient.email) && recipient.email.indexOf('@') !== -1; })
          .map(function(recipient) { return recipient.email; });

        if (!to.length)
        {
          return this.skip();
        }

        this.mailOptions = {
          to: to,
          replyTo: to,
          subject: '[WMES] [8D] Zmiana raportu: ' + entry.rid,
          html: ''
        };

        return module.prepareTemplateData('edit', entry, this.next());
      },
      function sendEmailStep(err, templateData)
      {
        if (err)
        {
          return this.skip(err);
        }

        this.mailOptions.html = renderEmail(templateData);

        mailSender.send(this.mailOptions, this.next());
      },
      function finalizeStep(err)
      {
        if (err)
        {
          module.error("Failed to notify users about a 8D entry change [%d]: %s", entry.rid, err.message);
        }
        else if (this.mailOptions)
        {
          module.info("Notified %d users about a 8D entry change: %d", this.mailOptions.to.length, entry.rid);
        }

        this.mailOptions = null;
      }
    );
  }
};
