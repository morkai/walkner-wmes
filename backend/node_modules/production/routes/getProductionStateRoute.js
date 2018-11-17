// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');
const moment = require('moment');

module.exports = function getProductionStateRoute(app, productionModule, req, res, next)
{
  const mongoose = app[productionModule.config.mongooseId];
  const Setting = mongoose.model('Setting');
  const FactoryLayout = mongoose.model('FactoryLayout');
  const WhOrderStatus = mongoose.model('WhOrderStatus');

  step(
    function()
    {
      Setting
        .find({_id: /^(factoryLayout|production)/}, {value: 1})
        .lean()
        .exec(this.parallel());

      productionModule.getProdLineStates(this.parallel());

      FactoryLayout
        .findById('default', {live: 1})
        .lean()
        .exec(this.parallel());

      WhOrderStatus
        .find({
          '_id.date': moment.utc().startOf('day').subtract(moment().hours() < 6 ? 1 : 0, 'days').toDate(),
          status: 3
        }, {updater: 0, updatedAt: 0})
        .lean()
        .exec(this.parallel());
    },
    function(err, settings, prodLineStates, factoryLayout, whOrderStatuses)
    {
      if (err)
      {
        return next(err);
      }

      return res.json({
        settings,
        prodLineStates,
        factoryLayout,
        whOrderStatuses
      });
    }
  );
};
