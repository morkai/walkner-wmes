// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const moment = require('moment');
const step = require('h5.step');

module.exports = function readPlanRoute(app, module, req, res, next)
{
  const mongoose = app[module.config.mongooseId];
  const Plan = mongoose.model('Plan');

  step(
    function()
    {
      const fields = {};

      if (req.query.pceTimes === '0')
      {
        fields['lines.orders.pceTimes'] = 0;
      }

      Plan.findById(req.params.id, fields).lean().exec(this.parallel());

      if (req.query.minMaxDates === '1')
      {
        Plan.findOne({}, {_id: 1}).sort({_id: 1}).lean().exec(this.parallel());
        Plan.findOne({}, {_id: 1}).sort({_id: -1}).lean().exec(this.parallel());
      }
    },
    function(err, plan, minDate, maxDate)
    {
      if (err)
      {
        return next(err);
      }

      if (!plan)
      {
        return next(app.createError('NOT_FOUND', 404));
      }

      if (minDate)
      {
        plan.minDate = moment.utc(minDate._id).format('YYYY-MM-DD');
      }

      if (maxDate)
      {
        plan.maxDate = moment.utc(maxDate._id).format('YYYY-MM-DD');
      }

      res.json(plan);
    }
  );
};
