// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');

module.exports = function editWhOrderStatusRoute(app, module, req, res, next)
{
  const userModule = app[module.config.userId];
  const ordersModule = app[module.config.ordersId];
  const mongoose = app[module.config.mongooseId];
  const WhOrderStatus = mongoose.model('WhOrderStatus');

  const {body} = req;
  const _id = {
    date: new Date(body.date),
    line: body.line,
    orderNo: body.orderNo,
    groupNo: body.groupNo
  };

  step(
    function()
    {
      WhOrderStatus.findById(_id).exec(this.next());
    },
    function(err, whOrderStatus)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!whOrderStatus)
      {
        whOrderStatus = new WhOrderStatus({_id, qtySent: 0});
      }

      whOrderStatus.set({
        updatedAt: new Date(),
        updater: userModule.createUserInfo(req.session.user, req),
        status: body.status,
        qtySent: Math.max(0, body.status === 3 ? (whOrderStatus.qtySent + body.qtySent) : 0),
        pceTime: body.pceTime
      });
      whOrderStatus.save(this.next());
    },
    function(err, whOrderStatus)
    {
      if (err)
      {
        return next(err);
      }

      res.sendStatus(204);

      app.broker.publish('planning.whOrderStatuses.updated', whOrderStatus.toJSON());

      if (!body.comment)
      {
        return;
      }

      ordersModule.editOrder(
        whOrderStatus._id.orderNo,
        {
          source: 'wh',
          comment: body.comment
        },
        whOrderStatus.updater,
        err =>
        {
          if (err)
          {
            ordersModule.error(`Failed to comment WH order [${whOrderStatus._id.orderNo}]: ${err.message}`);
          }
        }
      );
    }
  );
};
