// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const fs = require('fs');
const _ = require('lodash');
const step = require('h5.step');
const ejs = require('ejs');
const moment = require('moment');

module.exports = function setUpQiNotifier(app, module)
{
  const mailSender = app[module.config.mailSenderId];
  const mongoose = app[module.config.mongooseId];
  const orgUnits = app[module.config.orgUnitsId];
  const User = mongoose.model('User');
  const QiKind = mongoose.model('QiKind');
  const QiErrorCategory = mongoose.model('QiErrorCategory');

  const EMAIL_URL_PREFIX = module.config.emailUrlPrefix;

  const emailTemplateFile = __dirname + '/nokOwner.email.pl.ejs';
  const renderEmail = ejs.compile(fs.readFileSync(emailTemplateFile, 'utf8'), {
    cache: true,
    filename: emailTemplateFile,
    compileDebug: false,
    rmWhitespace: true
  });
  const nameMaps = {
    kind: {},
    errorCategory: {}
  };

  app.broker.subscribe('qi.results.added', handleAddedResult);
  app.broker.subscribe('qi.results.edited', handleEditedResult);

  function handleAddedResult(message)
  {
    const result = message.model;

    if (result.nokOwner)
    {
      notifyNokOwner(result);
    }
  }

  function handleEditedResult(message)
  {
    const result = message.model;

    if (result.nokOwner && result.changes[result.changes.length - 1].data.nokOwner)
    {
      notifyNokOwner(result);
    }
  }

  function notifyNokOwner(result)
  {
    step(
      function findNokOwnerStep()
      {
        User.findById(result.nokOwner.id).lean().exec(this.next());
      },
      function findManagerStep(err, nokOwner)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!nokOwner || !nokOwner.email)
        {
          return this.skip();
        }

        this.recipients = [nokOwner.email];

        if (!nokOwner.orgUnitId)
        {
          return;
        }

        const orgUnit = orgUnits.getByTypeAndId(nokOwner.orgUnitType, nokOwner.orgUnitId);

        if (!orgUnit)
        {
          return;
        }

        const division = nokOwner.orgUnitType === 'subdivision' ? orgUnit.division : orgUnit._id;

        User.findOne({prodFunction: 'manager', orgUnitId: division}).lean().exec(this.next());
      },
      function prepareTemplateDataStep(err, manager)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (manager && manager.email)
        {
          this.recipients.push(manager.email);
        }

        this.mailOptions = {
          to: this.recipients,
          subject: '[WMES] Przypisanie do wyniku inspekcji: ' + result.rid,
          html: ''
        };

        return prepareTemplateData('add', result, this.next());
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
          module.error('Failed to notify the NOK owner about a result [%d]: %s', result.rid, err.message);
        }
        else if (this.mailOptions)
        {
          module.info('Notified the NOK owner [%s] about a result: %d', this.mailOptions.to, result.rid);
        }

        this.mailOptions = null;
      }
    );
  }

  function prepareTemplateData(mode, result, done)
  {
    const templateData = {
      mode: mode,
      urlPrefix: EMAIL_URL_PREFIX,
      result: {
        rid: result.rid,
        orderNo: result.orderNo,
        nc12: result.nc12,
        productFamily: result.productFamily,
        productName: result.productName,
        division: result.division,
        line: result.line,
        leader: result.leader ? result.leader.label : '',
        date: moment(result.date).format('LL'),
        inspector: result.inspector.label,
        nokOwner: result.nokOwner ? result.nokOwner.label : '',
        qtyOrder: (result.qtyOrder || 0).toLocaleString(),
        qtyInspected: (result.qtyInspected || 0).toLocaleString(),
        qtyNokInspected: (result.qtyNokInspected || 0).toLocaleString(),
        qtyToFix: (result.qtyToFix || 0).toLocaleString(),
        qtyNok: (result.qtyNok || 0).toLocaleString(),
        faultCode: result.faultCode,
        faultDescription: result.faultDescription,
        problem: result.problem,
        immediateActions: result.immediateActions,
        rootCause: result.rootCause
      }
    };

    step(
      function()
      {
        findName(QiKind, result, 'kind', 'name', this.parallel());
        findName(QiErrorCategory, result, 'errorCategory', 'name', this.parallel());
      },
      function(err, kind, errorCategory)
      {
        if (err)
        {
          return done(err);
        }

        templateData.result.kind = kind;
        templateData.result.errorCategory = errorCategory;

        return done(null, templateData);
      }
    );
  }

  function findName(Model, model, mapProperty, nameProperty, done)
  {
    const id = model[mapProperty];
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
