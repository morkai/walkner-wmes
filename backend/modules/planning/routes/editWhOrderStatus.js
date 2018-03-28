// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');
const moment = require('moment');

module.exports = function editWhOrderStatusRoute(app, module, req, res, next)
{
  const userModule = app[module.config.userId];
  const mongoose = app[module.config.mongooseId];
  const WhOrderStatus = mongoose.model('WhOrderStatus');

  const planId = moment.utc(req.params.id, 'YYYY-MM-DD').toDate();

  step(
    function()
    {
      WhOrderStatus.findById(planId, {_id: 1}).lean().exec(this.next());
    },
    function(err, whOrderStatus)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!whOrderStatus)
      {
        whOrderStatus = new WhOrderStatus({
          _id: planId,
          orders: {}
        });
        whOrderStatus.save(this.next());
      }
      else
      {
        setImmediate(this.next());
      }
    },
    function(err)
    {
      if (err && err.code !== 11000)
      {
        return next(err);
      }

      this.key = req.body.key;
      this.value = {
        status: req.body.status,
        updatedAt: new Date(),
        updater: userModule.createUserInfo(req.session.user, req)
      };

      WhOrderStatus.collection.update({_id: planId}, {$set: {[`orders.${this.key}`]: this.value}}, this.next());
    },
    function(err)
    {
      if (err)
      {
        return next(err);
      }

      res.sendStatus(204);

      app.broker.publish(`planning.whOrderStatuses.updated.${planId}`, {
        plan: req.params.id,
        key: this.key,
        value: this.value
      });
    }
  );
};
