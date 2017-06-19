// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const fs = require('fs');
const _ = require('lodash');
const step = require('h5.step');
const ejs = require('ejs');
const moment = require('moment');

module.exports = function setUpKaizenNotifier(app, kaizenModule)
{
  const mailSender = app[kaizenModule.config.mailSenderId];
  const mongoose = app[kaizenModule.config.mongooseId];
  const User = mongoose.model('User');
  const KaizenSection = mongoose.model('KaizenSection');
  const KaizenArea = mongoose.model('KaizenArea');
  const KaizenCategory = mongoose.model('KaizenCategory');
  const KaizenCause = mongoose.model('KaizenCause');
  const KaizenRisk = mongoose.model('KaizenRisk');

  const EMAIL_URL_PREFIX = kaizenModule.config.emailUrlPrefix;

  const emailTemplateFile = __dirname + '/notifier.email.pl.ejs';
  const renderEmail = ejs.compile(fs.readFileSync(emailTemplateFile, 'utf8'), {
    cache: true,
    filename: emailTemplateFile,
    compileDebug: false,
    rmWhitespace: true
  });
  const nameMaps = {
    status: {
      new: 'Nowe',
      accepted: 'Zaakceptowane',
      todo: 'Do realizacji',
      inProgress: 'W realizacji',
      paused: 'Zatrzymane',
      finished: 'Zakończone',
      cancelled: 'Anulowane'
    },
    section: {},
    area: {},
    nearMissCategory: {},
    cause: {},
    risk: {},
    behaviour: {}
  };

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
    const recipients = [];

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
          subject: '[WMES] Nowe zgłoszenie ZPW: ' + kaizenOrder.rid,
          html: ''
        };

        return prepareTemplateData('add', kaizenOrder, this.next());
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
          kaizenModule.error('Failed to notify users about a new order [%d]: %s', kaizenOrder.rid, err.message);
        }
        else if (this.mailOptions)
        {
          kaizenModule.info('Notified %d users about a new order: %d', this.mailOptions.to.length, kaizenOrder.rid);
        }

        this.mailOptions = null;
      }
    );
  }

  function notifyAboutEdit(kaizenOrder, usersToNotify)
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
      function sendEmailStep(err, recipients)
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
          subject: '[WMES] Zmiana zgłoszenia ZPW: ' + kaizenOrder.rid,
          html: ''
        };

        return prepareTemplateData('edit', kaizenOrder, this.next());
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
          kaizenModule.error('Failed to notify users about an order change [%d]: %s', kaizenOrder.rid, err.message);
        }
        else if (this.mailOptions)
        {
          kaizenModule.info('Notified %d users about an order change: %d', this.mailOptions.to.length, kaizenOrder.rid);
        }

        this.mailOptions = null;
      }
    );
  }

  function prepareTemplateData(mode, kaizenOrder, done)
  {
    const templateData = {
      mode: mode,
      urlPrefix: EMAIL_URL_PREFIX,
      nearMiss: {
        rid: kaizenOrder.rid,
        subject: kaizenOrder.subject,
        section: kaizenOrder.section,
        confirmer: kaizenOrder.confirmer.label,
        owners: kaizenOrder.nearMissOwners.map(function(o) { return o.label; }).join('; '),
        category: kaizenOrder.nearMissCategory,
        area: kaizenOrder.area,
        cause: kaizenOrder.cause,
        risk: kaizenOrder.risk,
        behaviour: kaizenOrder.behaviour,
        status: nameMaps.status[kaizenOrder.status],
        eventDate: moment(kaizenOrder.date).format('LLLL'),
        description: kaizenOrder.description,
        causeText: kaizenOrder.causeText,
        correctiveMeasures: kaizenOrder.correctiveMeasures,
        preventiveMeasures: kaizenOrder.preventiveMeasures,
        comment: mode === 'add' ? '' : _.last(kaizenOrder.changes).comment
      }
    };

    step(
      function()
      {
        findName(KaizenSection, kaizenOrder, 'section', 'name', this.parallel());
        findName(KaizenArea, kaizenOrder, 'area', 'name', this.parallel());
        findName(KaizenCategory, kaizenOrder, 'nearMissCategory', 'name', this.parallel());
        findName(KaizenCause, kaizenOrder, 'cause', 'name', this.parallel());
        findName(KaizenRisk, kaizenOrder, 'risk', 'name', this.parallel());
        findName(KaizenRisk, kaizenOrder, 'behaviour', 'name', this.parallel());
      },
      function(err, section, area, category, cause, risk, behaviour)
      {
        if (err)
        {
          return done(err);
        }

        templateData.nearMiss.section = section;
        templateData.nearMiss.area = area;
        templateData.nearMiss.category = category;
        templateData.nearMiss.cause = cause;
        templateData.nearMiss.risk = risk;
        templateData.nearMiss.behaviour = behaviour;

        return done(null, templateData);
      }
    );
  }

  function findName(Model, kaizenOrder, mapProperty, nameProperty, done)
  {
    const id = kaizenOrder[mapProperty];
    const nameMap = nameMaps[mapProperty];
    const multiple = _.isArray(id);

    if (multiple)
    {
      const names = [];

      _.forEach(id, function(id)
      {
        if (nameMap[id])
        {
          names.push(nameMap[id]);
        }
      });

      if (names.length === id.length)
      {
        return setImmediate(done, null, names);
      }
    }
    else if (nameMap[id])
    {
      return setImmediate(done, null, nameMap[id]);
    }

    const conditions = {
      _id: multiple ? {$in: id} : id
    };
    const fields = {};
    fields[nameProperty] = 1;

    Model.find(conditions, fields).lean().exec(function(err, models)
    {
      if (err)
      {
        return done(err);
      }

      if (_.isEmpty(models))
      {
        return done(null, id);
      }

      if (multiple)
      {
        const names = [];

        _.forEach(models, function(model)
        {
          const name = model[nameProperty];

          nameMap[model._id] = name;

          names.push(name);
        });

        return done(null, names);
      }

      return done(null, models[0][nameProperty]);
    });
  }
};
