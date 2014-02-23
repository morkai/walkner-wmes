'use strict';

var step = require('h5.step');

module.exports = function startFixRoutes(app, express)
{
  function onlySuper(req, res, next)
  {
    var user = req.session.user;

    if (user && user.super)
    {
      return next();
    }

    return res.send(403);
  }

  express.get('/fix/prodShiftOrderDurations', onlySuper, fixProdShiftOrderDurations);

  function fixProdShiftOrderDurations(req, res, next)
  {
    app.mongoose.model('ProdShiftOrder')
      .find({finishedAt: {$ne: null}}, {startedAt: 1, finishedAt: 1})
      .exec(function(err, prodShiftOrders)
      {
        if (err)
        {
          return next(err);
        }

        var steps = [];

        prodShiftOrders.forEach(function(prodShiftOrder)
        {
          steps.push(function()
          {
            var next = this.next();

            app.production.getProdData(null, prodShiftOrder._id, function(err, cachedProdShiftOrder)
            {
              if (cachedProdShiftOrder)
              {
                cachedProdShiftOrder.recalcDurations(true, next);
              }
              else
              {
                prodShiftOrder.recalcDurations(true, next);
              }
            });
          });
        });

        steps.push(function()
        {
          res.type('txt');
          res.send("ALL DONE!");
        });

        step(steps);
      });
  }
};
