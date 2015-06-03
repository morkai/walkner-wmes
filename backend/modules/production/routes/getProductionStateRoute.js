// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
      Setting.find({_id: /^factoryLayout/}, {value: 1}).lean().exec(this.parallel());
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
