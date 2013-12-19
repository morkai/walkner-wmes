'use strict';

var lodash = require('lodash');
var crud = require('../express/crud');

module.exports = function setUpProdDowntimesRoutes(app, prodDowntimesModule)
{
  var express = app[prodDowntimesModule.config.expressId];
  var userModule = app[prodDowntimesModule.config.userId];
  var ProdDowntime = app[prodDowntimesModule.config.mongooseId].model('ProdDowntime');

  var canView = userModule.auth('PROD_DOWNTIMES:VIEW');

  express.get('/prodDowntimes', canView, limitAors, crud.browseRoute.bind(null, app, ProdDowntime));

  express.get('/prodDowntimes/:id', canView, crud.readRoute.bind(null, app, ProdDowntime));

  function limitAors(req, res, next)
  {
    var user = req.session.user;
    var userAors = user.aors || [];

    if (user.super || !userAors.length)
    {
      return next();
    }

    var selectors = req.rql.selector.args;

    var aorTerm = lodash.find(selectors, function(term)
    {
      return term.name === 'eq' && term.args[0] === 'aor';
    });

    if (!aorTerm)
    {
      if (userAors.length === 1)
      {
        selectors.push({name: 'eq', args: ['aor', userAors[0]]});
      }
      else
      {
        selectors.push({name: 'in', args: ['aor', userAors]});
      }

      return next();
    }

    if (userAors.indexOf(aorTerm.args[1]) === -1)
    {
      return res.send(403);
    }

    return next();
  }
};
