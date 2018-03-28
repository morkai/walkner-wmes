// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');
const moment = require('moment');

module.exports = function readWhOrderStatusRoute(app, module, req, res, next)
{
  const mongoose = app[module.config.mongooseId];
  const WhOrderStatus = mongoose.model('WhOrderStatus');

  const planId = moment.utc(req.params.id, 'YYYY-MM-DD').toDate();

  step(
    function()
    {
      WhOrderStatus.findById(planId).lean().exec(this.next());
    },
    function(err, whOrderStatus)
    {
      if (err)
      {
        return next(err);
      }

      if (!whOrderStatus)
      {
        whOrderStatus = {
          _id: planId,
          orders: {}
        };
      }

      res.json(whOrderStatus);
    }
  );
};
