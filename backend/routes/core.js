'use strict';

var requirejsConfig = require('../../config/require');

module.exports = function startCoreRoutes(app, express)
{
  var appCache = app.options.env === 'production';
  var requirejsPaths = JSON.stringify(requirejsConfig.paths);
  var requirejsShim = JSON.stringify(requirejsConfig.shim);

  express.get('/', showIndex);

  express.get('/time', function(req, res)
  {
    res.send(Date.now().toString());
  });

  express.get('/config.js', sendRequireJsConfig);

  express.get('/wmes.appcache', sendAppCacheManifest);

  function showIndex(req, res, next)
  {
    var sessionUser = req.session.user;
    var locale = sessionUser && sessionUser.locale ? sessionUser.locale : 'pl';
    var prodFunctions = app.mongoose.model('User').schema.path('prodFunction').enumValues;

    res.render('index', {
      appCache: appCache,
      appData: {
        TIME: JSON.stringify(Date.now()),
        LOCALE: JSON.stringify(locale),
        GUEST_USER: JSON.stringify(app.user.guest),
        PRIVILEGES: JSON.stringify(app.user.config.privileges),
        PROD_FUNCTIONS: JSON.stringify(prodFunctions),
        ORDER_STATUSES: JSON.stringify(app.orderStatuses.models),
        DOWNTIME_REASONS: JSON.stringify(app.downtimeReasons.models),
        AORS: JSON.stringify(app.aors.models),
        COMPANIES: JSON.stringify(app.companies.models),
        PROD_TASKS: JSON.stringify(app.prodTasks.models),
        PROD_CENTERS: JSON.stringify(app.prodCenters.models)
      }
    });
  }

  function sendRequireJsConfig(req, res)
  {
    res.type('js');
    res.render('config.js.ejs', {
      paths: requirejsPaths,
      shim: requirejsShim
    });
  }

  function sendAppCacheManifest(req, res)
  {
    if (appCache)
    {
      res.type('text/cache-manifest');
      res.sendfile('wmes.appcache', {root: express.get('static path')});
    }
    else
    {
      res.send(404);
    }
  }
};
