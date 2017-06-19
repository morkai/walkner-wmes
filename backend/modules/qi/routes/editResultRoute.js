// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const prepareAttachments = require('./prepareAttachments');

module.exports = function editResultRoute(app, qiModule, req, res, next)
{
  const userModule = app[qiModule.config.userId];
  const mongoose = app[qiModule.config.mongooseId];
  const QiResult = mongoose.model('QiResult');

  const user = req.session.user;
  const input = {
    comment: req.body.comment
  };

  if (userModule.isAllowedTo(user, 'QI:RESULTS:MANAGE'))
  {
    Object.assign(input, req.body);
    prepareAttachments(qiModule.tmpAttachments, input);
  }
  else
  {
    const inspector = userModule.isAllowedTo(user, 'QI:INSPECTOR');
    const specialist = userModule.isAllowedTo(user, 'QI:SPECIALIST');
    const master = userModule.isAllowedTo(user, 'FN:master');
    const leader = userModule.isAllowedTo(user, 'FN:leader');

    if (inspector)
    {
      Object.assign(input, _.omit(req.body, [
        'errorCategory',
        'rootCause',
        'correctiveActions'
      ]));
      prepareAttachments(qiModule.tmpAttachments, input);
    }

    if (specialist)
    {
      Object.assign(input, _.pick(req.body, [
        'errorCategory',
        'immediateActions',
        'rootCause',
        'correctiveActions'
      ]));
    }

    if (master || leader)
    {
      Object.assign(input, _.pick(req.body, [
        'immediateActions',
        'rootCause',
        'correctiveActions'
      ]));
    }
  }

  const updater = userModule.createUserInfo(user, req);
  updater.id = updater.id.toString();

  step(
    function findResultStep()
    {
      QiResult.findById(req.params.id).exec(this.next());
    },
    function applyChangesStep(err, qiResult)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!qiResult)
      {
        return this.skip(app.createError('NOT_FOUND', 404));
      }

      const changed = qiResult.applyChanges(input, updater);

      if (changed)
      {
        qiResult.save(this.next());
      }
    },
    function sendResponseStep(err, qiResult)
    {
      if (err)
      {
        return next(err);
      }

      if (qiResult)
      {
        res.json(qiResult);

        app.broker.publish('qi.results.edited', {
          model: qiResult,
          user: updater
        });
      }
      else
      {
        res.json({_id: req.params.id});
      }
    }
  );
};
