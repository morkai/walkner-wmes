// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var step = require('h5.step');

module.exports = function getProductionStateRoute(app, productionModule, req, res, next)
{
  var mongoose = app[productionModule.config.mongooseId];
  var Setting = mongoose.model('Setting');
  var FactoryLayout = mongoose.model('FactoryLayout');

  step(
    function()
    {
      Setting.find({_id: /^(factoryLayout|production)/}, {value: 1}).lean().exec(this.parallel());
      productionModule.getProdLineStates(this.parallel());
      FactoryLayout.findById('default', {live: 1}).lean().exec(this.parallel());
    },
    function(err, settings, prodLineStates, factoryLayout)
    {
      if (err)
      {
        return next(err);
      }

      return res.json({
        settings: settings,
        prodLineStates: prodLineStates,
        factoryLayout: factoryLayout
      });
    }
  );
};
