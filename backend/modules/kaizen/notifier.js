// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var fs = require('fs');
var _ = require('lodash');
var step = require('h5.step');
var ejs = require('ejs');
var moment = require('moment');

module.exports = function setUpKaizenNotifier(app, kaizenModule)
{
  var mailSender = app[kaizenModule.config.mailSenderId];
  var mongoose = app[kaizenModule.config.mongooseId];
  var User = mongoose.model('User');
  var KaizenSection = mongoose.model('KaizenSection');
  var KaizenArea = mongoose.model('KaizenArea');
  var KaizenCategory = mongoose.model('KaizenCategory');
  var KaizenCause = mongoose.model('KaizenCause');
  var KaizenRisk = mongoose.model('KaizenRisk');

  var EMAIL_URL_PREFIX = kaizenModule.config.emailUrlPrefix;

  var emailTemplateFile = __dirname + '/notifier.email.pl.ejs';
  var renderEmail = ejs.compile(fs.readFileSync(emailTemplateFile, 'utf8'), {
    cache: true,
    filename: emailTemplateFile,
    compileDebug: false,
    rmWhitespace: true
  });
  var nameMaps = {
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
          kaizenModule.error("Failed to notify users about a new order [%d]: %s", kaizenOrder.rid, err.message);
        }
        else if (this.mailOptions)
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

  function prepareTemplateData(mode, kaizenOrder, done)
  {
    var templateData = {
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
    var id = kaizenOrder[mapProperty];
    var nameMap = nameMaps[mapProperty];
    var multiple = _.isArray(id);

    if (multiple)
    {
      var names = [];

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

    var conditions = {
      _id: multiple ? {$in: id} : id
    };
    var fields = {};
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
        var names = [];

        _.forEach(models, function(model)
        {
          var name = model[nameProperty];

          nameMap[model._id] = name;

          names.push(name);
        });

        return done(null, names);
      }

      return done(null, models[0][nameProperty]);
    });
  }
};
