// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var fs = require('fs');
var _ = require('lodash');
var step = require('h5.step');
var ejs = require('ejs');
var moment = require('moment');

module.exports = function setUpSuggestionsNotifier(app, module)
{
  var mailSender = app[module.config.mailSenderId];
  var mongoose = app[module.config.mongooseId];
  var User = mongoose.model('User');
  var KaizenSection = mongoose.model('KaizenSection');
  var KaizenCategory = mongoose.model('KaizenCategory');
  var KaizenProductFamily = mongoose.model('KaizenProductFamily');
  var Suggestion = mongoose.model('Suggestion');

  var EMAIL_URL_PREFIX = module.config.emailUrlPrefix;

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
    categories: {},
    productFamily: {}
  };

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
          subject: '[WMES] Nowe zgłoszenie usprawnień: ' + suggestion.rid,
          html: ''
        };

        return prepareTemplateData('add', suggestion, this.next());
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
          module.error("Failed to notify users about a new suggestion [%d]: %s", suggestion.rid, err.message);
        }
        else if (this.mailOptions)
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
      function prepareTemplateDataStep(err, recipients)
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
          subject: '[WMES] Zmiana zgłoszenia usprawnień: ' + suggestion.rid,
          html: ''
        };

        return prepareTemplateData('edit', suggestion, this.next());
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

  function prepareTemplateData(mode, suggestion, done)
  {
    var templateData = {
      mode: mode,
      urlPrefix: EMAIL_URL_PREFIX,
      suggestion: {
        rid: suggestion.rid,
        subject: suggestion.subject,
        section: suggestion.section,
        confirmer: suggestion.confirmer.label,
        owners: suggestion.suggestionOwners.map(function(o) { return o.label; }).join('; '),
        categories: suggestion.categories.join('; '),
        productFamily: suggestion.productFamily,
        status: nameMaps.status[suggestion.status],
        date: moment(suggestion.date).format('LL'),
        howItIs: suggestion.howItIs,
        howItShouldBe: suggestion.howItShouldBe,
        suggestion: suggestion.suggestion,
        comment: mode === 'add' ? '' : _.last(suggestion.changes).comment
      }
    };

    step(
      function()
      {
        findName(KaizenSection, suggestion, 'section', 'name', this.parallel());
        findName(KaizenCategory, suggestion, 'categories', 'name', this.parallel());
        findName(KaizenProductFamily, suggestion, 'productFamily', 'name', this.parallel());
      },
      function(err, section, categories, productFamily)
      {
        if (err)
        {
          return done(err);
        }

        templateData.suggestion.section = section;
        templateData.suggestion.categories = categories.join('; ');
        templateData.suggestion.productFamily = productFamily;

        return done(null, templateData);
      }
    );
  }

  function findName(Model, suggestion, mapProperty, nameProperty, done)
  {
    var id = suggestion[mapProperty];
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
