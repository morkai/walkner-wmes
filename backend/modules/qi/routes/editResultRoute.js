// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');
const prepareAttachments = require('./prepareAttachments');

module.exports = function editResultRoute(app, qiModule, req, res, next)
{
  const userModule = app[qiModule.config.userId];
  const mongoose = app[qiModule.config.mongooseId];
  const QiResult = mongoose.model('QiResult');

  const user = req.session.user;
  const body = req.body;

  prepareAttachments(qiModule.tmpAttachments, body);

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

      const changed = qiResult.applyChanges(body, updater);

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
